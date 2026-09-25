"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { normalizeOrderCode } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ArrowRight, CopyIcon, SearchIcon } from "@/components/ui/Icons";

/**
 * The seller's main tool. Accepts the bare code, the code in any case, or the
 * whole WhatsApp message ("Hi, my order code is SBM-7K42P").
 */
export function OrderSearch({ size = "lg", defaultValue = "", autoFocus }: { size?: "hero" | "lg" | "sm"; defaultValue?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [pending, start] = useTransition();
  const code = normalizeOrderCode(value);
  const recognised = code.length === 9; // "SBM-" + 5

  const submit = (raw = value) => {
    const c = normalizeOrderCode(raw);
    if (c) start(() => router.push(`/admin/orders/${c}`));
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      if (normalizeOrderCode(text).length === 9) submit(text);
    } catch {
      /* clipboard permission denied: the owner can still long-press → paste */
    }
  };

  if (size === "hero") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mx-auto w-full max-w-2xl"
      >
        <label htmlFor="order-code" className="sr-only">Order code</label>
        <div className="relative">
          <input
            id="order-code"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SBM-7K42P"
            autoFocus={autoFocus}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            className="h-20 w-full rounded-2xl bg-cream px-6 pr-28 text-center font-mono text-2xl font-semibold tracking-[0.18em] text-charcoal uppercase ring-1 ring-white/10 outline-none placeholder:text-taupe/45 focus:ring-4 focus:ring-blush sm:h-24 sm:text-4xl"
          />
          <button
            type="button"
            onClick={paste}
            className="absolute top-1/2 right-3 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-linen px-3 py-2 text-[0.68rem] font-bold tracking-[0.1em] text-espresso uppercase hover:bg-blush/60"
          >
            <CopyIcon width={14} height={14} /> Paste
          </button>
        </div>
        <p className={cn("mt-3 min-h-5 text-center text-sm", recognised ? "text-blush" : "text-mist")}>
          {value && recognised && value.trim().toUpperCase() !== code ? `Found code ${code} in your message` : "Paste the code or the customer's whole WhatsApp message"}
        </p>
        <button disabled={!code || pending} className="btn btn-blush mt-5 w-full !min-h-16 !text-sm disabled:!bg-white/10 disabled:!text-mist disabled:!shadow-none">
          {pending ? "Finding…" : (<><SearchIcon width={19} height={19} /> Find order</>)}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn("flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-charcoal ring-1 ring-charcoal/10 focus-within:ring-4 focus-within:ring-blush/60", size === "lg" && "sm:p-2 sm:pl-6")}
    >
      <SearchIcon className="shrink-0 text-taupe" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Find order code, e.g. SBM-7K42P"
        aria-label="Order code"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        className={cn("min-w-0 flex-1 bg-transparent font-mono tracking-wider uppercase outline-none placeholder:font-sans placeholder:tracking-normal placeholder:normal-case placeholder:text-taupe/80", size === "lg" ? "py-2.5 text-base sm:text-lg" : "py-1.5 text-sm")}
      />
      <button
        disabled={!code || pending}
        className={cn("inline-flex shrink-0 items-center gap-2 rounded-full bg-charcoal font-bold tracking-[0.12em] text-cream uppercase transition hover:bg-ink disabled:opacity-40", size === "lg" ? "h-12 px-5 text-xs sm:px-7" : "h-9 px-4 text-[0.68rem]")}
      >
        Find <ArrowRight width={16} height={16} className="hidden sm:block" />
      </button>
    </form>
  );
}
