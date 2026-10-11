import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import type { Pool } from "pg";
import type { AdminUser, Category, CustomerAccount, Order, Product, StoreSettings } from "../types";
import { buildSeedOrders, buildSeedProducts, seedCategories } from "./seed";

// The shop's storage. Everything else goes through ./repo.ts, so only this
// file knows where data physically lives:
//
// • DATABASE_URL set (Render free plan + Neon): a Postgres table, so nothing is
//   lost when Render restarts or sleeps. The table is created automatically.
// • Otherwise: a JSON file in DATA_DIR (a Render paid disk, a VPS, or ./data locally).

export interface DbShape {
  categories: Category[];
  products: Product[];
  orders: Order[];
  admins: AdminUser[];
  /** Optional customer accounts (guests never appear here) */
  customers: CustomerAccount[];
  settings: StoreSettings;
}

export const defaultSettings: StoreSettings = { bankName: "", accountNumber: "", accountName: "", paymentNote: "" };

/** Fills in collections added after the data was first created. */
function migrate(db: Partial<DbShape>): DbShape {
  return {
    categories: db.categories ?? [],
    products: db.products ?? [],
    orders: db.orders ?? [],
    admins: db.admins ?? [],
    customers: db.customers ?? [],
    settings: { ...defaultSettings, ...db.settings },
  };
}

function seed(): DbShape {
  const products = buildSeedProducts();
  return migrate({ categories: seedCategories, products, orders: buildSeedOrders(products) });
}

// ─────────────────────────────────────────────────────────────
// Postgres (Neon): one small key → text table
// ─────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
export const usesDatabase = Boolean(DATABASE_URL);

let pool: Promise<Pool> | null = null;

function getPool(): Promise<Pool> {
  // Loaded only when a database is configured, so the website build never needs it
  pool ??= import("pg").then(async ({ default: pg }) => {
    const p = new pg.Pool({
      connectionString: DATABASE_URL,
      max: 3,
      // Neon's free compute sleeps after a few idle minutes and drops open
      // connections; close ours first so we never reuse a dead one.
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    });
    p.on("error", (err) => console.warn("[store] idle database connection closed:", err.message));
    await p.query(`
      CREATE TABLE IF NOT EXISTS sbi_store (
        key        text PRIMARY KEY,
        value      text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
    return p;
  });
  pool.catch(() => (pool = null)); // retry on the next request if the first connect failed
  return pool;
}

/** Runs a query, retrying once if the database was asleep and dropped the connection. */
async function query<T>(text: string, params: unknown[]): Promise<T[]> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await (await getPool()).query(text, params);
      return res.rows as T[];
    } catch (e) {
      if (attempt >= 2) throw e;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

async function kvGet(key: string): Promise<string | null> {
  const rows = await query<{ value: string }>("SELECT value FROM sbi_store WHERE key = $1", [key]);
  return rows[0]?.value ?? null;
}

async function kvPut(key: string, value: string) {
  await query(
    `INSERT INTO sbi_store (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value],
  );
}

// ─────────────────────────────────────────────────────────────
// JSON file
// ─────────────────────────────────────────────────────────────

// • Render paid disk / VPS: DATA_DIR points at the persistent folder.
// • Vercel with no backend (preview): the project folder is read-only, so use the
//   temp dir. Data there resets whenever Vercel starts a fresh instance.
// • Local dev: ./data
const DATA_DIR =
  process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "shoppedbyimma") : path.join(process.cwd(), "data"));
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

async function writeFileAtomic(file: string, data: string | Buffer) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file); // atomic swap: a crash never leaves half a file
}

// ─────────────────────────────────────────────────────────────
// Shared in-memory copy + serialised writes
// ─────────────────────────────────────────────────────────────

// Kept on globalThis so every server bundle in this process (pages, server
// actions, route handlers, dev hot reloads) shares one in-memory copy.
const g = globalThis as unknown as {
  __sbiDb?: { loading: Promise<DbShape> | null; queue: Promise<unknown> };
};
const state = (g.__sbiDb ??= { loading: null, queue: Promise.resolve() });

async function init(): Promise<DbShape> {
  if (usesDatabase) {
    // A read error throws (and is retried on the next request). Only a
    // genuinely empty table gets the demo data, so real data is never overwritten.
    const raw = await kvGet("db");
    if (raw) return migrate(JSON.parse(raw));
    const db = seed();
    await kvPut("db", JSON.stringify(db));
    return db;
  }
  try {
    return migrate(JSON.parse(await fs.readFile(DB_FILE, "utf8")));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const db = seed();
    // Never let a failed first save take the whole site down: the demo
    // catalogue still renders from memory.
    await persist(db).catch((err) => console.warn("[store] could not save seed data:", err.message));
    return db;
  }
}

function load(): Promise<DbShape> {
  if (!state.loading) {
    state.loading = init().catch((e) => {
      state.loading = null; // let the next request retry
      throw e;
    });
  }
  return state.loading;
}

async function persist(db: DbShape) {
  const json = JSON.stringify(db);
  if (usesDatabase) await kvPut("db", json);
  else await writeFileAtomic(DB_FILE, json);
}

export async function read(): Promise<DbShape> {
  return load();
}

/** Serialises writes so two simultaneous checkouts can't clobber each other. */
export function write<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    try {
      await persist(db);
    } catch (e) {
      // The save failed, so drop the in-memory copy: the next request reloads
      // what's actually stored instead of showing a change that wasn't saved.
      state.loading = null;
      throw e;
    }
    return result;
  });
  state.queue = run.catch(() => undefined);
  return run;
}

// ─────────────────────────────────────────────────────────────
// Uploaded product photos
// ─────────────────────────────────────────────────────────────

export async function putFile(name: string, data: Buffer) {
  if (usesDatabase) await kvPut(`upload:${name}`, data.toString("base64"));
  else await writeFileAtomic(path.join(UPLOAD_DIR, name), data);
}

export async function getFile(name: string): Promise<Buffer | null> {
  try {
    if (usesDatabase) {
      const b64 = await kvGet(`upload:${name}`);
      return b64 ? Buffer.from(b64, "base64") : null;
    }
    return await fs.readFile(path.join(UPLOAD_DIR, name));
  } catch {
    return null;
  }
}

/** Where the data lives, for the backend's startup log and health check. */
export const storageKind = usesDatabase ? "postgres" : `file (${DATA_DIR})`;
