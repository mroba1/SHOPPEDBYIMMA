"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/actions/admin";
import { ArrowRight } from "@/components/ui/Icons";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold tracking-[0.14em] text-nude uppercase">Password</span>
        <div className="flex items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-blush">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            autoFocus
            autoComplete="current-password"
            className="h-14 min-w-0 flex-1 bg-transparent px-4 text-base outline-none"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="px-4 text-xs font-semibold tracking-[0.1em] text-mist uppercase hover:text-cream">
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      {state?.error && <p role="alert" className="animate-rise text-sm text-blush">{state.error}</p>}
      <button disabled={pending} className="btn btn-blush w-full disabled:opacity-60">
        {pending ? "Logging in…" : (<>Log in <ArrowRight width={18} height={18} /></>)}
      </button>
    </form>
  );
}
