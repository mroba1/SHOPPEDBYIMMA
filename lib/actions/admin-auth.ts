"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminLoginUrl, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import {
  changeAdminPassword,
  logoutAdminEverywhere,
  resetAdminPassword,
  updateAdminProfile,
  updateSettings,
  verifyAdminLogin,
} from "@/lib/data/repo";
import { sessionSecret } from "@/lib/session";

export type FormState = { error?: string; ok?: string } | undefined;

// ---------- Login / logout ----------

export async function adminLogin(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password." };
  if (!sessionSecret()) return { error: "Admin login is disabled until SESSION_SECRET is set on the server." };

  const res = await verifyAdminLogin(email, password);
  if (!res.ok) return { error: res.error };
  await startAdminSession(res.user);

  const next = String(form.get("next") ?? "");
  // Only ever redirect inside the admin area (no open redirects)
  redirect(/^\/admin\/[\w/-]*$/.test(next) ? next : "/admin/dashboard");
}

export async function adminLogout() {
  await endAdminSession();
  redirect(await adminLoginUrl());
}

export async function adminResetPassword(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "");
  const key = String(form.get("recoveryKey") ?? "");
  const next = String(form.get("password") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  try {
    await resetAdminPassword(email, key, next);
    return { ok: "Password updated. You can log in with your new password." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't reset the password." };
  }
}

// ---------- Settings ----------

export async function saveAdminProfile(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  try {
    await updateAdminProfile(admin.id, { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") });
    revalidatePath("/admin", "layout");
    return { ok: "Profile saved." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't save." };
  }
}

export async function saveAdminPassword(_: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const next = String(form.get("password") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  try {
    const updated = await changeAdminPassword(admin.id, String(form.get("current") ?? ""), next);
    // Other devices are now signed out; keep this one signed in with a fresh session
    await startAdminSession(updated);
    return { ok: "Password changed. Other devices have been signed out." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't change the password." };
  }
}

export async function signOutEverywhere() {
  const admin = await requireAdmin();
  await logoutAdminEverywhere(admin.id);
  await endAdminSession();
  redirect(await adminLoginUrl());
}

export async function savePaymentSettings(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  await updateSettings({
    bankName: String(form.get("bankName") ?? ""),
    accountNumber: String(form.get("accountNumber") ?? ""),
    accountName: String(form.get("accountName") ?? ""),
    paymentNote: String(form.get("paymentNote") ?? ""),
  });
  revalidatePath("/admin", "layout");
  return { ok: "Payment details saved. They'll appear in your WhatsApp replies." };
}
