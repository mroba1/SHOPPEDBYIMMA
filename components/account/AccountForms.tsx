"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  claimGuestOrder,
  customerLogin,
  customerRegister,
  saveCustomerPassword,
  saveCustomerProfile,
  type AccountFormState,
} from "@/lib/actions/account";
import type { PublicCustomer } from "@/lib/types";
import { cn } from "@/lib/cn";

const input = (error?: boolean) =>
  cn(
    "w-full rounded-2xl border bg-white/80 px-4 py-3.5 text-base outline-none transition placeholder:text-taupe/70 focus:bg-white focus:ring-4",
    error ? "border-rouge/70 focus:ring-rouge/10" : "border-charcoal/15 focus:border-charcoal/50 focus:ring-blush/40",
  );

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-[0.14em] uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-taupe">{hint}</span>}
    </label>
  );
}

function Message({ state }: { state: AccountFormState }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p role={state.error ? "alert" : "status"} className={cn("animate-rise rounded-2xl px-4 py-3 text-sm", state.error ? "bg-rouge/10 text-rouge" : "bg-blush/40")}>
      {state.error ?? `✓ ${state.ok}`}
    </p>
  );
}

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState(customerLogin, undefined);
  // Controlled fields survive React's post-action form reset, so mistakes don't wipe everything
  const [identifier, setIdentifier] = useState("");
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {notice && <p className="rounded-2xl bg-blush/40 px-4 py-3 text-sm">{notice}</p>}
      <Field label="WhatsApp number or email">
        <input name="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" placeholder="0803 123 4567" className={input()} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" className={input()} />
      </Field>
      <Message state={state} />
      <button disabled={pending} className="btn btn-dark w-full disabled:opacity-60">{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-taupe">
        New here? <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-charcoal underline underline-offset-4">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next, claim }: { next: string; claim?: string }) {
  const [state, action, pending] = useActionState(customerRegister, undefined);
  const [v, setV] = useState({ name: "", whatsapp: "", email: "" });
  const bind = (k: keyof typeof v) => ({ value: v[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value })) });
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      {claim && <input type="hidden" name="claim" value={claim} />}
      <Field label="Your name">
        <input name="name" {...bind("name")} required autoComplete="name" className={input(state?.field === "name")} placeholder="e.g. Jane Doe" />
      </Field>
      <Field label="WhatsApp number" hint={claim ? `Use the number you ordered with and ${claim} will be added to your account.` : "You'll sign in with this."}>
        <input name="whatsapp" {...bind("whatsapp")} type="tel" inputMode="tel" required autoComplete="tel" className={input(state?.field === "whatsapp")} placeholder="0803 123 4567" />
      </Field>
      <Field label="Email (optional)">
        <input name="email" {...bind("email")} type="email" autoComplete="email" className={input(state?.field === "email")} />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={input()} />
      </Field>
      <Message state={state} />
      <button disabled={pending} className="btn btn-dark w-full disabled:opacity-60">{pending ? "Creating account…" : "Create account"}</button>
      <p className="text-center text-sm text-taupe">
        Already have one? <Link href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-charcoal underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  );
}

export function ProfileForm({ me }: { me: PublicCustomer }) {
  const [state, action, pending] = useActionState(saveCustomerProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><input name="name" defaultValue={me.name} required className={input()} /></Field>
        <Field label="Email (optional)"><input name="email" type="email" defaultValue={me.email ?? ""} className={input()} /></Field>
      </div>
      <Field label="WhatsApp number" hint="Message us on WhatsApp if you need to change your number.">
        <input value={me.whatsapp} disabled className={cn(input(), "opacity-60")} />
      </Field>
      <Field label="Saved delivery address" hint="Filled in for you at checkout.">
        <textarea name="address" defaultValue={me.address ?? ""} rows={3} className={cn(input(), "resize-none")} placeholder="House number, street, area, city, state" />
      </Field>
      <Message state={state} />
      <button disabled={pending} className="btn btn-dark !min-h-12 disabled:opacity-60">{pending ? "Saving…" : "Save details"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(saveCustomerPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Current password"><input name="current" type="password" required autoComplete="current-password" className={input()} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password"><input name="password" type="password" required minLength={8} autoComplete="new-password" className={input()} /></Field>
        <Field label="Repeat new password"><input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input()} /></Field>
      </div>
      <Message state={state} />
      <button disabled={pending} className="btn btn-dark !min-h-12 disabled:opacity-60">{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}

export function ClaimOrderForm() {
  const [state, action, pending] = useActionState(claimGuestOrder, undefined);
  return (
    <form action={action} className="space-y-3">
      <div className="flex gap-2">
        <input name="code" required placeholder="SBM-7K42P" autoCapitalize="characters" className={cn(input(), "font-mono uppercase")} />
        <button disabled={pending} className="btn btn-dark shrink-0 !min-h-0 !px-5 disabled:opacity-60">{pending ? "…" : "Add"}</button>
      </div>
      <Message state={state} />
    </form>
  );
}
