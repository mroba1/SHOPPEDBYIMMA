import { randomUUID, timingSafeEqual } from "crypto";
import type { AdminUser, CustomerAccount, PublicAdmin, PublicCustomer, StoreSettings } from "../types";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "../password";
import { read, write } from "./store";

// Admin + optional customer accounts, login protection, and store settings.
// Password hashes never leave this file: every function returns the
// Public* shape without `passwordHash`.

const phoneKey = (p: string) => p.replace(/\D/g, "").replace(/^234/, "0");

// ---------- Customers list for the admin ----------

export interface CustomerSummary {
  name: string;
  whatsapp: string;
  email?: string;
  address: string;
  hasAccount: boolean;
  orders: number;
  totalSpent: number;
  lastOrderAt?: string;
  lastOrderCode?: string;
}

/** Everyone who has ordered (guest or not) plus account holders with no orders yet. */
export async function listCustomers(): Promise<CustomerSummary[]> {
  const db = await read();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const accounts = new Map(db.customers.map((c) => [phoneKey(c.whatsapp), c]));
  const map = new Map<string, CustomerSummary>();
  for (const o of orders) {
    const key = phoneKey(o.customer.whatsapp);
    const paid = o.paymentStatus === "CONFIRMED" && o.status !== "CANCELLED" ? o.total : 0;
    const existing = map.get(key);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += paid;
      continue;
    }
    const acc = accounts.get(key);
    map.set(key, {
      name: o.customer.name,
      whatsapp: o.customer.whatsapp,
      email: acc?.email,
      address: o.customer.address,
      hasAccount: Boolean(acc),
      orders: 1,
      totalSpent: paid,
      lastOrderAt: o.createdAt,
      lastOrderCode: o.code,
    });
  }
  for (const [key, acc] of accounts) {
    if (!map.has(key)) {
      map.set(key, { name: acc.name, whatsapp: acc.whatsapp, email: acc.email, address: acc.address ?? "", hasAccount: true, orders: 0, totalSpent: 0 });
    }
  }
  return [...map.values()];
}

// ---------- Login protection ----------

// In memory is enough for one backend instance: 5 wrong passwords locks
// that login for 15 minutes.
const attempts = new Map<string, { fails: number; until: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

function minutesLocked(key: string) {
  const a = attempts.get(key);
  if (!a || a.until < Date.now()) return 0;
  return Math.ceil((a.until - Date.now()) / 60000);
}

/** Counts a failed attempt; returns the lock length in minutes if this one triggered a lock. */
function recordFail(key: string): number {
  const a = attempts.get(key) ?? { fails: 0, until: 0 };
  a.fails += 1;
  let locked = 0;
  if (a.fails >= MAX_FAILS) {
    a.until = Date.now() + LOCK_MS;
    a.fails = 0;
    locked = LOCK_MS / 60000;
  }
  attempts.set(key, a);
  return locked;
}

const lockedMessage = (mins: number) => `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`;

export type LoginResult<T> = { ok: true; user: T } | { ok: false; error: string };

// ---------- Admin accounts ----------

function publicAdmin(a: AdminUser): PublicAdmin {
  const { passwordHash, ...rest } = a;
  void passwordHash;
  return rest;
}

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD, read on the
 * server that owns the data (Render in production). Production has no
 * default password: without those variables nobody can log in.
 */
async function ensureAdmin() {
  const db = await read();
  if (db.admins.length) return;
  const isProd = process.env.NODE_ENV === "production";
  const email = (process.env.ADMIN_EMAIL || (isProd ? "" : "admin@shoppedbyimma.com")).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (isProd ? "" : "imma-admin");
  if (!email || !password) return;
  const passwordHash = await hashPassword(password);
  await write((d) => {
    if (d.admins.length) return;
    d.admins.push({
      id: `adm_${randomUUID().slice(0, 10)}`,
      name: process.env.ADMIN_NAME || "Imma",
      email,
      passwordHash,
      sessionVersion: 1,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function adminSetupStatus() {
  await ensureAdmin();
  const db = await read();
  return { hasAdmin: db.admins.length > 0, recoveryEnabled: Boolean(process.env.ADMIN_RECOVERY_KEY) };
}

export async function verifyAdminLogin(email: string, password: string): Promise<LoginResult<PublicAdmin>> {
  await ensureAdmin();
  const normalized = email.trim().toLowerCase();
  const key = `admin:${normalized}`;
  const mins = minutesLocked(key);
  if (mins) return { ok: false, error: lockedMessage(mins) };

  const db = await read();
  const admin = db.admins.find((a) => a.email === normalized);
  // Always run the hash check so a wrong email takes as long as a wrong password
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash()));
  if (!admin || !valid) {
    const lock = recordFail(key);
    return { ok: false, error: lock ? lockedMessage(lock) : "That email or password isn't right." };
  }
  attempts.delete(key);
  const updated = await write((d) => {
    const a = d.admins.find((x) => x.id === admin.id)!;
    a.lastLoginAt = new Date().toISOString();
    return a;
  });
  return { ok: true, user: publicAdmin(updated) };
}

export async function getAdmin(id: string) {
  const db = await read();
  const a = db.admins.find((x) => x.id === id);
  return a ? publicAdmin(a) : null;
}

export async function updateAdminProfile(id: string, input: { name: string; email: string }) {
  return write((db) => {
    const a = db.admins.find((x) => x.id === id);
    if (!a) throw new Error("Admin not found");
    const email = input.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (db.admins.some((x) => x.email === email && x.id !== id)) throw new Error("Another admin already uses that email.");
    a.name = input.name.trim() || a.name;
    a.email = email;
    return publicAdmin(a);
  });
}

export async function changeAdminPassword(id: string, current: string, next: string) {
  const db = await read();
  const a = db.admins.find((x) => x.id === id);
  if (!a || !(await verifyPassword(current, a.passwordHash))) throw new Error("Your current password isn't right.");
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);
  const passwordHash = await hashPassword(next);
  return write((d) => {
    const x = d.admins.find((y) => y.id === id)!;
    x.passwordHash = passwordHash;
    x.sessionVersion += 1; // signs out every other device
    return publicAdmin(x);
  });
}

export async function logoutAdminEverywhere(id: string) {
  return write((db) => {
    const a = db.admins.find((x) => x.id === id);
    if (a) a.sessionVersion += 1;
  });
}

/** "Forgot password?": proves ownership with ADMIN_RECOVERY_KEY, set only on the server. */
export async function resetAdminPassword(email: string, recoveryKey: string, next: string) {
  const expected = process.env.ADMIN_RECOVERY_KEY ?? "";
  if (!expected) throw new Error("Password reset isn't set up on this server.");
  const normalized = email.trim().toLowerCase();
  const key = `recover:${normalized}`;
  const mins = minutesLocked(key);
  if (mins) throw new Error(lockedMessage(mins));

  const given = Buffer.from(recoveryKey.trim());
  const want = Buffer.from(expected);
  const db = await read();
  const admin = db.admins.find((a) => a.email === normalized);
  if (!admin || given.length !== want.length || !timingSafeEqual(given, want)) {
    const lock = recordFail(key);
    throw new Error(lock ? lockedMessage(lock) : "That email or recovery key isn't right.");
  }
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);
  const passwordHash = await hashPassword(next);
  attempts.delete(key);
  await write((d) => {
    const a = d.admins.find((x) => x.id === admin.id)!;
    a.passwordHash = passwordHash;
    a.sessionVersion += 1;
  });
}

// ---------- Optional customer accounts ----------

function publicCustomer(c: CustomerAccount): PublicCustomer {
  const { passwordHash, ...rest } = c;
  void passwordHash;
  return rest;
}

export async function registerCustomer(input: { name: string; whatsapp: string; email?: string; password: string }) {
  const problem = passwordProblem(input.password);
  if (problem) throw new Error(problem);
  const passwordHash = await hashPassword(input.password);
  return write((db) => {
    const email = input.email?.trim().toLowerCase() || undefined;
    if (db.customers.some((c) => phoneKey(c.whatsapp) === phoneKey(input.whatsapp)))
      throw new Error("An account with this WhatsApp number already exists. Try logging in.");
    if (email && db.customers.some((c) => c.email === email)) throw new Error("An account with this email already exists. Try logging in.");
    const c: CustomerAccount = {
      id: `cus_${randomUUID().slice(0, 10)}`,
      name: input.name.trim(),
      whatsapp: input.whatsapp.trim(),
      email,
      passwordHash,
      sessionVersion: 1,
      createdAt: new Date().toISOString(),
    };
    db.customers.push(c);
    return publicCustomer(c);
  });
}

/** Customers log in with their WhatsApp number or email. */
export async function verifyCustomerLogin(identifier: string, password: string): Promise<LoginResult<PublicCustomer>> {
  const id = identifier.trim().toLowerCase();
  const byEmail = id.includes("@");
  const key = `customer:${byEmail ? id : phoneKey(id)}`;
  const mins = minutesLocked(key);
  if (mins) return { ok: false, error: lockedMessage(mins) };

  const db = await read();
  const c = byEmail ? db.customers.find((x) => x.email === id) : db.customers.find((x) => phoneKey(x.whatsapp) === phoneKey(id));
  const valid = await verifyPassword(password, c?.passwordHash ?? (await dummyHash()));
  if (!c || !valid) {
    const lock = recordFail(key);
    return { ok: false, error: lock ? lockedMessage(lock) : "That number/email or password isn't right." };
  }
  attempts.delete(key);
  return { ok: true, user: publicCustomer(c) };
}

export async function getCustomerAccount(id: string) {
  const db = await read();
  const c = db.customers.find((x) => x.id === id);
  return c ? publicCustomer(c) : null;
}

export async function updateCustomerProfile(id: string, input: { name: string; email?: string; address?: string }) {
  return write((db) => {
    const c = db.customers.find((x) => x.id === id);
    if (!c) throw new Error("Account not found");
    const email = input.email?.trim().toLowerCase() || undefined;
    if (email && db.customers.some((x) => x.email === email && x.id !== id)) throw new Error("Another account already uses that email.");
    c.name = input.name.trim() || c.name;
    c.email = email;
    c.address = input.address?.trim() || undefined;
    return publicCustomer(c);
  });
}

export async function changeCustomerPassword(id: string, current: string, next: string) {
  const db = await read();
  const c = db.customers.find((x) => x.id === id);
  if (!c || !(await verifyPassword(current, c.passwordHash))) throw new Error("Your current password isn't right.");
  const problem = passwordProblem(next);
  if (problem) throw new Error(problem);
  const passwordHash = await hashPassword(next);
  await write((d) => {
    const x = d.customers.find((y) => y.id === id)!;
    x.passwordHash = passwordHash;
    x.sessionVersion += 1;
  });
}

export async function listOrdersForCustomer(customerId: string) {
  const db = await read();
  return db.orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Adds an earlier guest order to an account. Needs the order code AND the
 * WhatsApp number the order was placed with, so a code alone can't be used
 * to take over someone else's order.
 */
export async function claimOrder(customerId: string, code: string) {
  return write((db) => {
    const c = db.customers.find((x) => x.id === customerId);
    const o = db.orders.find((x) => x.code === code);
    if (!c || !o || phoneKey(o.customer.whatsapp) !== phoneKey(c.whatsapp))
      throw new Error("We couldn't find an order with that code for your WhatsApp number.");
    if (o.customerId && o.customerId !== customerId) throw new Error("That order already belongs to another account.");
    o.customerId = customerId;
    return o.code;
  });
}

// ---------- Store settings ----------

export async function getSettings() {
  return (await read()).settings;
}

export async function updateSettings(input: Partial<StoreSettings>) {
  return write((db) => {
    db.settings = {
      bankName: (input.bankName ?? db.settings.bankName).trim().slice(0, 80),
      accountNumber: (input.accountNumber ?? db.settings.accountNumber).trim().slice(0, 30),
      accountName: (input.accountName ?? db.settings.accountName).trim().slice(0, 80),
      paymentNote: (input.paymentNote ?? db.settings.paymentNote).trim().slice(0, 300),
    };
    return db.settings;
  });
}
