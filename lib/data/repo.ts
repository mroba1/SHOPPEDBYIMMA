import "server-only";
import { randomInt, randomUUID } from "crypto";
import type { Category, CustomerInfo, Order, OrderStatus, PaymentStatus, Product } from "../types";
import { orderStatusLabel } from "../format";
import { site } from "../config";
import { read, write } from "./store";
import { slugify } from "./seed";

// ---------- Categories ----------

export async function listCategories(): Promise<Category[]> {
  const db = await read();
  return [...db.categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategory(slug: string) {
  const db = await read();
  return db.categories.find((c) => c.slug === slug) ?? null;
}

export async function saveCategory(input: Omit<Category, "id" | "slug" | "sortOrder"> & { id?: string }) {
  return write((db) => {
    if (input.id) {
      const c = db.categories.find((x) => x.id === input.id);
      if (!c) throw new Error("Category not found");
      Object.assign(c, { name: input.name, tagline: input.tagline, image: input.image, codePrefix: input.codePrefix });
      return c;
    }
    const slug = slugify(input.name);
    if (db.categories.some((c) => c.slug === slug)) throw new Error("A category with that name already exists");
    const cat: Category = {
      id: `cat_${randomUUID().slice(0, 8)}`,
      slug,
      name: input.name,
      tagline: input.tagline,
      image: input.image,
      codePrefix: input.codePrefix.toUpperCase().slice(0, 3),
      sortOrder: db.categories.length + 1,
    };
    db.categories.push(cat);
    return cat;
  });
}

export async function deleteCategory(id: string) {
  return write((db) => {
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return;
    if (db.products.some((p) => p.categorySlug === cat.slug))
      throw new Error("Move or delete the products in this category first");
    db.categories = db.categories.filter((c) => c.id !== id);
  });
}

// ---------- Products ----------

export async function listProducts(opts: { category?: string; includeUnavailable?: boolean } = {}) {
  const db = await read();
  return db.products
    .filter((p) => (opts.category ? p.categorySlug === opts.category : true))
    .sort((a, b) => Number(b.available) - Number(a.available) || b.createdAt.localeCompare(a.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await read();
  return db.products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const db = await read();
  return db.products.find((p) => p.id === id) ?? null;
}

/** Next free code in a category, e.g. SBM-FA-005 */
export async function suggestProductCode(categorySlug: string) {
  const db = await read();
  const cat = db.categories.find((c) => c.slug === categorySlug);
  const prefix = `${site.orderPrefix}-${cat?.codePrefix ?? "XX"}-`;
  const used = db.products
    .filter((p) => p.code.startsWith(prefix))
    .map((p) => parseInt(p.code.slice(prefix.length), 10) || 0);
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(3, "0")}`;
}

export type ProductInput = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">;

export async function saveProduct(input: ProductInput & { id?: string }) {
  return write((db) => {
    const code = input.code.trim().toUpperCase();
    const clash = db.products.find((p) => p.code === code && p.id !== input.id);
    if (clash) throw new Error(`Product code ${code} is already used by "${clash.name}"`);
    const now = new Date().toISOString();
    const slug = `${slugify(input.name)}-${code.slice(-6).toLowerCase().replace(/[^a-z0-9]/g, "")}`;

    if (input.id) {
      const p = db.products.find((x) => x.id === input.id);
      if (!p) throw new Error("Product not found");
      Object.assign(p, { ...input, code, slug, updatedAt: now });
      return p;
    }
    const product: Product = { ...input, code, slug, id: `prd_${randomUUID().slice(0, 10)}`, createdAt: now, updatedAt: now };
    db.products.push(product);
    return product;
  });
}

export async function setProductAvailability(id: string, available: boolean) {
  return write((db) => {
    const p = db.products.find((x) => x.id === id);
    if (p) {
      p.available = available;
      p.updatedAt = new Date().toISOString();
    }
  });
}

export async function deleteProduct(id: string) {
  // Past orders keep their own snapshot (name, code, image, price), so
  // deleting a product never breaks an order the seller still has to fulfil.
  return write((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
}

// ---------- Orders ----------

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read aloud

function newOrderCode(existing: Set<string>) {
  for (;;) {
    let body = "";
    for (let i = 0; i < 5; i++) body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
    const code = `${site.orderPrefix}-${body}`;
    if (!existing.has(code)) return code;
  }
}

export interface NewOrderLine {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}

export async function createOrder(customer: CustomerInfo, lines: NewOrderLine[]) {
  return write((db) => {
    const items = lines.map((l) => {
      const p = db.products.find((x) => x.id === l.productId);
      if (!p) throw new Error("One of the items in your cart is no longer in the shop. Please remove it and try again.");
      if (!p.available) throw new Error(`"${p.name}" just sold out. Please remove it from your cart.`);
      return {
        productId: p.id,
        productCode: p.code,
        slug: p.slug,
        name: p.name,
        image: p.images[0] ?? "",
        unitPrice: p.price, // always the server price, never the browser's
        size: l.size && p.sizes.includes(l.size) ? l.size : undefined,
        color: l.color && p.colors.includes(l.color) ? l.color : undefined,
        quantity: Math.min(Math.max(1, Math.floor(l.quantity)), 20),
      };
    });
    const now = new Date().toISOString();
    const order: Order = {
      id: `ord_${randomUUID().slice(0, 10)}`,
      code: newOrderCode(new Set(db.orders.map((o) => o.code))),
      customer,
      items,
      total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: now,
      updatedAt: now,
      history: [{ at: now, label: "Order created on website" }],
    };
    db.orders.push(order);
    return order;
  });
}

export async function listOrders() {
  const db = await read();
  return [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderByCode(code: string) {
  const db = await read();
  return db.orders.find((o) => o.code === code) ?? null;
}

export async function updateOrder(code: string, patch: { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
  return write((db) => {
    const o = db.orders.find((x) => x.code === code);
    if (!o) throw new Error("Order not found");
    const now = new Date().toISOString();

    if (patch.paymentStatus && patch.paymentStatus !== o.paymentStatus) {
      o.paymentStatus = patch.paymentStatus;
      o.history.push({ at: now, label: patch.paymentStatus === "CONFIRMED" ? "Payment marked as confirmed" : "Payment marked as pending" });
      // Confirming payment moves an early-stage order forward automatically.
      if (patch.paymentStatus === "CONFIRMED" && (o.status === "PENDING" || o.status === "CONFIRMED") && !patch.status) {
        patch.status = "PAYMENT_CONFIRMED";
      }
    }
    if (patch.status && patch.status !== o.status) {
      o.status = patch.status;
      o.history.push({ at: now, label: `Status changed to ${orderStatusLabel[patch.status]}` });
      if (patch.status === "PAYMENT_CONFIRMED" && o.paymentStatus !== "CONFIRMED") {
        o.paymentStatus = "CONFIRMED";
        o.history.push({ at: now, label: "Payment marked as confirmed" });
      }
    }
    o.updatedAt = now;
    return o;
  });
}

// ---------- Customers (derived from orders) ----------

export interface CustomerSummary {
  name: string;
  whatsapp: string;
  address: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: string;
  lastOrderCode: string;
}

export async function listCustomers(): Promise<CustomerSummary[]> {
  const orders = await listOrders(); // newest first
  const map = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const key = o.customer.whatsapp.replace(/\D/g, "").replace(/^234/, "0");
    const c = map.get(key);
    const paid = o.paymentStatus === "CONFIRMED" ? o.total : 0;
    if (c) {
      c.orders += 1;
      c.totalSpent += paid;
    } else {
      map.set(key, {
        name: o.customer.name,
        whatsapp: o.customer.whatsapp,
        address: o.customer.address,
        orders: 1,
        totalSpent: paid,
        lastOrderAt: o.createdAt,
        lastOrderCode: o.code,
      });
    }
  }
  return [...map.values()];
}

export async function getStats() {
  const orders = await listOrders();
  const live = orders.filter((o) => o.status !== "CANCELLED");
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    awaitingPayment: live.filter((o) => o.status === "CONFIRMED" && o.paymentStatus === "PENDING").length,
    paid: live.filter((o) => o.paymentStatus === "CONFIRMED").length,
    // Paid and waiting to be sourced/packed, or being packed now
    processing: orders.filter((o) => o.status === "PROCESSING" || o.status === "PAYMENT_CONFIRMED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    revenue: live.filter((o) => o.paymentStatus === "CONFIRMED").reduce((s, o) => s + o.total, 0),
  };
}
