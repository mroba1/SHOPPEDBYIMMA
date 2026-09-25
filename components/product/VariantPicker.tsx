"use client";

import { cn } from "@/lib/cn";

export function OptionChips({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset>
      <legend className="flex w-full items-baseline justify-between text-xs font-semibold tracking-[0.16em] uppercase">
        <span>
          {label}
          {value && <span className="ml-2 font-normal tracking-normal normal-case text-taupe">{value}</span>}
        </span>
        {error && <span className="animate-rise font-medium tracking-normal normal-case text-rouge">Please choose a {label.toLowerCase()}</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={cn(
              "min-h-11 min-w-12 rounded-full border px-4 text-sm font-medium transition-all duration-200 active:scale-95",
              value === o
                ? "border-charcoal bg-charcoal text-cream"
                : cn("bg-white/60 hover:border-charcoal", error ? "border-rouge/60" : "border-charcoal/20"),
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function QuantityStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex h-12 items-center rounded-full border border-charcoal/20 bg-white/60">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="grid h-full w-11 place-items-center rounded-full text-lg hover:bg-blush/25" aria-label="Decrease quantity">
        −
      </button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className="grid h-full w-11 place-items-center rounded-full text-lg hover:bg-blush/25" aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

/** Picks the only option automatically so single-size items need no extra tap. */
export const autoPick = (options: string[]) => (options.length === 1 ? options[0] : undefined);
