import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getAdmin, getCustomerAccount } from "@/lib/data/repo";
import type { PublicAdmin, PublicCustomer } from "@/lib/types";
import {
  ADMIN_COOKIE,
  ADMIN_DEVICE_COOKIE,
  ADMIN_SESSION_MS,
  CUSTOMER_COOKIE,
  CUSTOMER_SESSION_MS,
  adminPath,
  createToken,
  readToken,
} from "@/lib/session";

// Server-side authentication for both the admin and optional customer
// accounts. Passwords are verified in the data layer (never here, never in
// the browser); this file only issues and checks signed, httpOnly cookies.

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// ---------- Admin ----------

export async function startAdminSession(admin: PublicAdmin) {
  const token = createToken({ sub: admin.id, role: "admin", ver: admin.sessionVersion, exp: Date.now() + ADMIN_SESSION_MS });
  if (!token) throw new Error("SESSION_SECRET is not set on the server, so admin login is disabled.");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, { ...baseCookie, maxAge: ADMIN_SESSION_MS / 1000 });
  // Lets this browser be sent to the private login page when its session expires
  jar.set(ADMIN_DEVICE_COOKIE, "1", { ...baseCookie, maxAge: 60 * 60 * 24 * 365 });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** The signed-in admin, re-checked against the database on every request. */
export const getCurrentAdmin = cache(async (): Promise<PublicAdmin | null> => {
  const payload = readToken((await cookies()).get(ADMIN_COOKIE)?.value, "admin");
  if (!payload) return null;
  const admin = await getAdmin(payload.sub);
  // Password changed or "log out everywhere" since this token was issued
  if (!admin || admin.sessionVersion !== payload.ver) return null;
  return admin;
});

export async function adminLoginUrl(next?: string) {
  return `/${adminPath()}${next ? `?next=${encodeURIComponent(next)}` : ""}`;
}

/**
 * Guards every admin page and server action. Browsers that have logged in
 * before are sent to the private login page; anyone else gets a plain 404,
 * so the admin area's location isn't revealed.
 */
export async function requireAdmin(): Promise<PublicAdmin> {
  const admin = await getCurrentAdmin();
  if (admin) return admin;
  const jar = await cookies();
  if (jar.get(ADMIN_DEVICE_COOKIE)) redirect(await adminLoginUrl());
  notFound();
}

// ---------- Customers (optional accounts) ----------

export async function startCustomerSession(customer: PublicCustomer) {
  const token = createToken({ sub: customer.id, role: "customer", ver: customer.sessionVersion, exp: Date.now() + CUSTOMER_SESSION_MS });
  if (!token) throw new Error("Accounts are temporarily unavailable. You can still check out as a guest.");
  (await cookies()).set(CUSTOMER_COOKIE, token, { ...baseCookie, maxAge: CUSTOMER_SESSION_MS / 1000 });
}

export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export const getCurrentCustomer = cache(async (): Promise<PublicCustomer | null> => {
  const payload = readToken((await cookies()).get(CUSTOMER_COOKIE)?.value, "customer");
  if (!payload) return null;
  const customer = await getCustomerAccount(payload.sub);
  if (!customer || customer.sessionVersion !== payload.ver) return null;
  return customer;
});

export async function requireCustomer(next = "/account"): Promise<PublicCustomer> {
  const c = await getCurrentCustomer();
  if (!c) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return c;
}
