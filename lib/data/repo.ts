import "server-only";
import * as local from "./local-repo";

// The one import the rest of the app uses for data.
//
// • API_URL not set (local dev): calls ./local-repo directly — reads/writes data/db.json.
// • API_URL set (Vercel): forwards each call to the Render backend over HTTPS,
//   authenticated with API_SECRET. This runs on the server only, so the secret
//   never reaches the browser.

export type { CustomerSummary, NewOrderLine, ProductInput } from "./local-repo";

type Repo = typeof local;
type Method = keyof Repo;

const API_URL = process.env.API_URL?.replace(/\/+$/, "");

async function rpc(method: Method, args: unknown[]) {
  const res = await fetch(`${API_URL}/rpc/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.API_SECRET ?? ""}` },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { result?: unknown; error?: string };
  // Business errors ("… just sold out") come back as 400 and keep their message
  if (!res.ok) throw new Error(data.error ?? `Backend error (${res.status})`);
  return data.result;
}

function pick<K extends Method>(name: K): Repo[K] {
  if (!API_URL) return local[name];
  return ((...args: unknown[]) => rpc(name, args)) as Repo[K];
}

export const isRemote = Boolean(API_URL);
export const backendUrl = API_URL;

export const listCategories = pick("listCategories");
export const getCategory = pick("getCategory");
export const saveCategory = pick("saveCategory");
export const deleteCategory = pick("deleteCategory");
export const listProducts = pick("listProducts");
export const getProductBySlug = pick("getProductBySlug");
export const getProductById = pick("getProductById");
export const suggestProductCode = pick("suggestProductCode");
export const saveProduct = pick("saveProduct");
export const setProductAvailability = pick("setProductAvailability");
export const deleteProduct = pick("deleteProduct");
export const createOrder = pick("createOrder");
export const listOrders = pick("listOrders");
export const getOrderByCode = pick("getOrderByCode");
export const updateOrder = pick("updateOrder");
export const listCustomers = pick("listCustomers");
export const getStats = pick("getStats");
export const saveUpload = pick("saveUpload");
export const readUpload = local.readUpload; // remote mode fetches /uploads directly (see app/uploads)
