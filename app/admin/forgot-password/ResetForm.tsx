"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminResetPassword } from "@/lib/actions/admin-auth";

const input = "h-13 w-full rounded-2xl bg-white/[0.06] px-4 py-3.5 text-base ring-1 ring-white/15 outline-none focus:ring-2 focus:ring-blush";
const label = "mb-2 block text-xs font-semibold tracking-[0.14em] text-nude uppercase";

export function ResetForm({ loginHref }: { loginHref: string }) {
  const [state, action, pending] = useActionState(adminResetPassword, undefined);

  if (state?.ok) {
    return (
      <div className="mt-8">
        <p className="rounded-2xl bg-blush/15 p-4 text-sm text-blush">{state.ok}</p>
        <Link href={loginHref} className="btn btn-blush mt-6 w-full">Back to sign in</Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block"><span className={label}>Email</span><input name="email" type="email" required autoComplete="username" className={input} /></label>
      <label className="block"><span className={label}>Recovery key</span><input name="recoveryKey" type="password" required autoComplete="off" className={input} /></label>
      <label className="block"><span className={label}>New password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
      <label className="block"><span className={label}>Repeat new password</span><input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={input} /></label>
      {state?.error && <p role="alert" className="text-sm text-blush">{state.error}</p>}
      <button disabled={pending} className="btn btn-blush w-full disabled:opacity-60">{pending ? "Resetting…" : "Reset password"}</button>
      <Link href={loginHref} className="block text-center text-xs text-mist hover:text-cream">Back to sign in</Link>
    </form>
  );
}
