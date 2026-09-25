"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeOrderCode } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ArrowRight, SearchIcon } from "@/components/ui/Icons";

/** The seller's main tool: paste the code a customer sent on WhatsApp. */
export function OrderSearch({ size = "lg", defaultValue = "" }: { size?: "lg" | "sm"; defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const code = normalizeOrderCode(value);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code) router.push(`/admin/orders/${code}`);
      }}
      className={cn("flex items-center gap-2 rounded-full bg-cream p-1.5 pl-5 text-charcoal ring-1 ring-charcoal/10 focus-within:ring-4 focus-within:ring-blush/60", size === "lg" && "sm:p-2 sm:pl-6")}
    >
      <SearchIcon className="shrink-0 text-taupe" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter order code, e.g. SBM-7K42P"
        aria-label="Order code"
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        className={cn("min-w-0 flex-1 bg-transparent font-mono tracking-wider uppercase outline-none placeholder:font-sans placeholder:tracking-normal placeholder:normal-case placeholder:text-taupe/80", size === "lg" ? "py-2.5 text-base sm:text-lg" : "py-1.5 text-sm")}
      />
      <button
        disabled={!code}
        className={cn("inline-flex shrink-0 items-center gap-2 rounded-full bg-charcoal font-bold tracking-[0.12em] text-cream uppercase transition hover:bg-ink disabled:opacity-40", size === "lg" ? "h-12 px-5 text-xs sm:px-7" : "h-9 px-4 text-[0.68rem]")}
      >
        Find <ArrowRight width={16} height={16} className="hidden sm:block" />
      </button>
    </form>
  );
}
