"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { adminLogin } from "@/lib/actions/admin-auth";
import { ArrowRight } from "@/components/ui/Icons";

const field = "flex items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-blush";

export function LoginForm({ next, forgotHref }: { next: string; forgotHref: string | null }) {
  const [state, action, pending] = useActionState(adminLogin, undefined);
  const [show, setShow] = useState(false);
  // Controlled so a wrong password doesn't also wipe the email (React resets uncontrolled fields after an action)
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-nude uppercase">Email</span>
        <div className={field}>
          <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="username" inputMode="email" className="h-14 min-w-0 flex-1 bg-transparent px-4 text-base outline-none" />
        </div>
      </label>
      <label className="block">
        <span className="mb-2 flex items-baseline justify-between text-xs font-semibold tracking-[0.14em] text-nude uppercase">
          Password
          {forgotHref && (
            <Link href={forgotHref} className="font-medium tracking-normal normal-case text-blush hover:underline">
              Forgot password?
            </Link>
          )}
        </span>
        <div className={field}>
          <input name="password" type={show ? "text" : "password"} required autoComplete="current-password" className="h-14 min-w-0 flex-1 bg-transparent px-4 text-base outline-none" />
          <button type="button" onClick={() => setShow((s) => !s)} className="px-4 text-xs font-semibold tracking-[0.1em] text-mist uppercase hover:text-cream">
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      {state?.error && <p role="alert" className="animate-rise rounded-xl bg-blush/15 px-3 py-2 text-sm text-blush">{state.error}</p>}
      <button disabled={pending} className="btn btn-blush w-full disabled:opacity-60">
        {pending ? "Signing in…" : (<>Sign in <ArrowRight width={18} height={18} /></>)}
      </button>
    </form>
  );
}
