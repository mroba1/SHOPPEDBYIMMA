"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/Icons";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
      }
      className="inline-flex items-center gap-2 rounded-full bg-charcoal/8 px-4 py-2 text-xs font-bold tracking-[0.14em] uppercase transition hover:bg-charcoal/15"
    >
      {copied ? <CheckIcon width={15} height={15} /> : <CopyIcon width={15} height={15} />}
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}
