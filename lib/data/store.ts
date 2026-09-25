import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { randomUUID } from "crypto";
import type { AdminUser, Category, CustomerAccount, Order, Product, StoreSettings } from "../types";
import { buildSeedOrders, buildSeedProducts, seedCategories } from "./seed";

// A tiny JSON-file database so the MVP works end-to-end with zero setup.
// Everything else talks to the repository functions in ./repo.ts, so swapping
// this file for Prisma / Supabase / Mongo later touches only the data layer.

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

/** Fills in collections added after a data file was first created. */
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

// Where the JSON file and uploads live:
// • Render: DATA_DIR points at the mounted persistent disk (see render.yaml).
// • Vercel with no backend (preview mode): the project folder is read-only, so use
//   the temp dir. Data there resets whenever Vercel starts a fresh instance.
// • Local dev: ./data
const DATA_DIR =
  process.env.DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "shoppedbyimma") : path.join(process.cwd(), "data"));
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

// Kept on globalThis so every server bundle in this process (pages, server
// actions, route handlers, dev hot reloads) shares one in-memory copy.
const g = globalThis as unknown as {
  __sbiDb?: { loading: Promise<DbShape> | null; queue: Promise<unknown> };
};
const state = (g.__sbiDb ??= { loading: null, queue: Promise.resolve() });

async function init(): Promise<DbShape> {
  try {
    return migrate(JSON.parse(await fs.readFile(DB_FILE, "utf8")));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const products = buildSeedProducts();
    const db = migrate({ categories: seedCategories, products, orders: buildSeedOrders(products) });
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
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE); // atomic swap: a crash never leaves half a file
}

export async function read(): Promise<DbShape> {
  return load();
}

/** Serialises writes so two simultaneous checkouts can't clobber each other. */
export function write<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  state.queue = run.catch(() => undefined);
  return run;
}
