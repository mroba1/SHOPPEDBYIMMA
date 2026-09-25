"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endCustomerSession, requireCustomer, startCustomerSession } from "@/lib/auth";
import { changeCustomerPassword, claimOrder, registerCustomer, updateCustomerProfile, verifyCustomerLogin } from "@/lib/data/repo";
import { normalizeOrderCode } from "@/lib/format";

// Optional customer accounts. Nothing here is needed to shop:
// guest checkout works without any of it.

export type AccountFormState = { error?: string; ok?: string; field?: string } | undefined;

/** Only allow redirects back into our own storefront pages */
const safeNext = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return /^\/(account|checkout|cart|order\/[\w-]+)?$/.test(s) ? s || "/account" : "/account";
};

export async function customerRegister(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const name = String(form.get("name") ?? "").trim();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const digits = whatsapp.replace(/\D/g, "");

  if (name.length < 2) return { field: "name", error: "Please enter your name." };
  if (digits.length < 10 || digits.length > 15) return { field: "whatsapp", error: "Enter a valid WhatsApp number, e.g. 0803 123 4567." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: "email", error: "That email doesn't look right." };

  let customer;
  try {
    customer = await registerCustomer({ name: name.slice(0, 80), whatsapp: whatsapp.slice(0, 20), email: email.slice(0, 120) || undefined, password });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create your account." };
  }
  await startCustomerSession(customer);

  // Created right after checkout? Add that order to the new account.
  const claim = normalizeOrderCode(String(form.get("claim") ?? ""));
  if (claim) await claimOrder(customer.id, claim).catch(() => undefined);

  redirect(safeNext(form.get("next")));
}

export async function customerLogin(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const identifier = String(form.get("identifier") ?? "").slice(0, 120);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!identifier || !password) return { error: "Enter your WhatsApp number (or email) and password." };
  const res = await verifyCustomerLogin(identifier, password);
  if (!res.ok) return { error: res.error };
  await startCustomerSession(res.user);
  redirect(safeNext(form.get("next")));
}

export async function customerLogout() {
  await endCustomerSession();
  redirect("/");
}

export async function saveCustomerProfile(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const me = await requireCustomer();
  try {
    await updateCustomerProfile(me.id, {
      name: String(form.get("name") ?? "").slice(0, 80),
      email: String(form.get("email") ?? "").slice(0, 120),
      address: String(form.get("address") ?? "").slice(0, 300),
    });
    revalidatePath("/account");
    return { ok: "Saved. We'll use these details at checkout." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't save." };
  }
}

export async function saveCustomerPassword(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const me = await requireCustomer();
  const next = String(form.get("password") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." };
  try {
    await changeCustomerPassword(me.id, String(form.get("current") ?? ""), next);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't change the password." };
  }
  await endCustomerSession();
  redirect("/account/login?changed=1");
}

export async function claimGuestOrder(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const me = await requireCustomer();
  const code = normalizeOrderCode(String(form.get("code") ?? ""));
  if (!code) return { error: "Enter the order code, e.g. SBM-7K42P." };
  try {
    await claimOrder(me.id, code);
    revalidatePath("/account");
    return { ok: `${code} added to your account.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't add that order." };
  }
}
