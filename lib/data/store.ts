import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Category, Order, Product } from "../types";
import { buildSeedOrders, buildSeedProducts, seedCategories } from "./seed";

// A tiny JSON-file database so the MVP works end-to-end with zero setup.
// Everything else talks to the repository functions in ./repo.ts, so swapping
// this file for Prisma / Supabase / Mongo later touches only the data layer.

export interface DbShape {
  categories: Category[];
  products: Product[];
  orders: Order[];
}

// On Render, DATA_DIR points at the mounted persistent disk (see render.yaml).
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
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
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DbShape;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const products = buildSeedProducts();
    const db: DbShape = { categories: seedCategories, products, orders: buildSeedOrders(products) };
    await persist(db);
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
