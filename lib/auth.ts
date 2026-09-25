import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single-seller admin login. Set ADMIN_PASSWORD and ADMIN_SECRET in .env.local.
// When you add real accounts, replace this file with your auth provider.

const COOKIE = "sbi_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secret = () => process.env.ADMIN_SECRET || "dev-only-secret-change-me";
export const adminPassword = () => process.env.ADMIN_PASSWORD || "imma-admin";

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  return safeEqual(sign(input), sign(adminPassword()));
}

export async function startSession() {
  const expires = Date.now() + MAX_AGE * 1000;
  const jar = await cookies();
  jar.set(COOKIE, `${expires}.${sign(String(expires))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
