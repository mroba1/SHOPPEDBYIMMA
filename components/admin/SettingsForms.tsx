"use client";

import { useActionState, useState } from "react";
import { savePaymentSettings, saveAdminPassword, saveAdminProfile, signOutEverywhere, type FormState } from "@/lib/actions/admin-auth";
import type { StoreSettings } from "@/lib/types";
import { cn } from "@/lib/cn";

const input = "h-12 w-full rounded-xl border border-charcoal/15 bg-cream/60 px-4 text-[0.95rem] outline-none transition focus:bg-white focus:ring-4 focus:ring-blush/40";

function Card({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-7">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-taupe">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-[0.12em] uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-taupe">{hint}</span>}
    </label>
  );
}

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role={state.error ? "alert" : "status"} className={cn("animate-rise rounded-xl px-3 py-2 text-sm", state.error ? "bg-rouge/10 text-rouge" : "bg-blush/40 text-charcoal")}>
      {state.error ?? `✓ ${state.ok}`}
    </p>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button disabled={pending} className="btn btn-dark !min-h-12 !px-6 !text-[0.7rem] disabled:opacity-60">
      {pending ? "Saving…" : children}
    </button>
  );
}

// Fields are controlled so React's automatic post-action form reset can't
// flash the old values back after a successful save.
function useFields<T extends Record<string, string>>(initial: T) {
  const [v, setV] = useState(initial);
  const bind = (k: keyof T) => ({
    name: String(k),
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value })),
  });
  return bind;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(saveAdminProfile, undefined);
  const bind = useFields({ name, email });
  return (
    <Card id="profile" title="Admin profile" hint="Your name appears in the sidebar. You log in with this email.">
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input {...bind("name")} required className={input} /></Field>
          <Field label="Login email"><input {...bind("email")} type="email" required autoComplete="email" className={input} /></Field>
        </div>
        <Status state={state} />
        <Submit pending={pending}>Save profile</Submit>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(saveAdminPassword, undefined);
  return (
    <Card id="password" title="Change password" hint="At least 8 characters. Changing it signs out every other device.">
      <form action={action} className="space-y-4">
        <Field label="Current password"><input name="current" type="password" required autoComplete="current-password" className={input} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password"><input name="password" type="password" required minLength={8} autoComplete="new-password" className={input} /></Field>
          <Field label="Repeat new password"><input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></Field>
        </div>
        <Status state={state} />
        <Submit pending={pending}>Change password</Submit>
      </form>
    </Card>
  );
}

export function PaymentForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState(savePaymentSettings, undefined);
  const bind = useFields({ ...settings });
  return (
    <Card id="payment" title="Payment details" hint="Used in the “send payment details” WhatsApp reply on every order. Customers only see this when you send it.">
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bank"><input {...bind("bankName")} placeholder="e.g. GTBank" className={input} /></Field>
          <Field label="Account number"><input {...bind("accountNumber")} inputMode="numeric" placeholder="0123456789" className={cn(input, "font-mono")} /></Field>
          <Field label="Account name"><input {...bind("accountName")} placeholder="ShoppedByImma" className={input} /></Field>
        </div>
        <Field label="Extra note (optional)" hint="e.g. “Please use your order code as the transfer description.”">
          <textarea {...bind("paymentNote")} rows={2} className={cn(input, "h-auto resize-none py-3")} />
        </Field>
        <Status state={state} />
        <Submit pending={pending}>Save payment details</Submit>
      </form>
    </Card>
  );
}

export function SecurityCard({ loginPath, sessionHours }: { loginPath: string; sessionHours: number }) {
  return (
    <Card id="security" title="Security" hint="How your admin area is protected.">
      <ul className="space-y-3 text-sm text-espresso">
        <li className="rounded-xl bg-linen/70 px-4 py-3">
          <span className="block text-xs font-semibold tracking-[0.12em] text-taupe uppercase">Private login address</span>
          <span className="mt-1 block font-mono break-all">/{loginPath}</span>
          <span className="mt-1 block text-xs text-taupe">Bookmark it. The address can be changed with ADMIN_PATH. It&apos;s only a convenience: your password is what actually protects the dashboard.</span>
        </li>
        <li className="rounded-xl bg-linen/70 px-4 py-3">
          <span className="block text-xs font-semibold tracking-[0.12em] text-taupe uppercase">Sessions</span>
          <span className="mt-1 block">You&apos;re signed out automatically after {sessionHours} hours.</span>
        </li>
      </ul>
      <form action={signOutEverywhere} className="mt-5">
        <button className="rounded-full px-5 py-3 text-xs font-bold tracking-[0.12em] text-rouge uppercase ring-1 ring-rouge/30 transition hover:bg-rouge/8">
          Log out of all devices
        </button>
      </form>
    </Card>
  );
}
