import { createHmac, timingSafeEqual } from "crypto";

// Signed session tokens, used by proxy.ts (fast first check) and lib/auth.ts
// (full check against the database). Format: base64url(payload).signature
//
// The payload carries the account's sessionVersion. Changing the password or
// "log out everywhere" bumps that version, which invalidates every old token.

export type Role = "admin" | "customer";

export interface SessionPayload {
  sub: string;
  role: Role;
  ver: number;
  exp: number; // ms since epoch
}

export const ADMIN_COOKIE = "sbi_admin";
export const CUSTOMER_COOKIE = "sbi_customer";
/** Non-secret hint that this browser has logged into the admin before */
export const ADMIN_DEVICE_COOKIE = "sbi_admin_device";

export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours
export const CUSTOMER_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * In production a real secret is required: without one, sessions can't be
 * created or trusted, so admin login is simply disabled.
 */
export function sessionSecret(): string | null {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_SECRET;
  if (s && s.length >= 16) return s;
  return process.env.NODE_ENV === "production" ? null : "dev-only-session-secret-not-for-production";
}

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(payload: SessionPayload): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function readToken(token: string | undefined, role: Role): SessionPayload | null {
  const secret = sessionSecret();
  if (!token || !secret) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (payload.role !== role || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** The private admin login URL segment, e.g. "manage-shoppedbyimma". Set with ADMIN_PATH. */
export function adminPath() {
  const p = (process.env.ADMIN_PATH || "manage-shoppedbyimma").replace(/[^a-zA-Z0-9-_]/g, "");
  // Never let it collide with real routes
  return ["admin", "shop", "product", "cart", "checkout", "order", "account", "uploads", "_next"].includes(p) ? "manage-shoppedbyimma" : p;
}
