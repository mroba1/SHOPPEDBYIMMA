"use client";

import Link from "next/link";
import type { CartLine } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCart } from "./CartProvider";
import { ProductImage } from "@/components/ui/ProductImage";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";

export function CartItem({ line, tone = "light", onNavigate }: { line: CartLine; tone?: "light" | "dark"; onNavigate?: () => void }) {
  const { setQuantity, remove } = useCart();
  const dark = tone === "dark";
  const variant = [line.size && `Size ${line.size}`, line.color].filter(Boolean).join(" · ");

  return (
    <li className="animate-rise flex gap-4 py-5">
      <Link href={`/product/${line.slug}`} onClick={onNavigate} className="relative block w-24 shrink-0 overflow-hidden sm:w-28">
        <ProductImage src={line.image} alt={line.name} className="aspect-[4/5] w-full" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/product/${line.slug}`} onClick={onNavigate} className="line-clamp-2 font-medium leading-snug hover:underline">
              {line.name}
            </Link>
            <p className={cn("code-label mt-1", dark ? "text-mist" : "text-taupe")}>{line.productCode}</p>
            {variant && <p className={cn("mt-1 text-sm", dark ? "text-nude" : "text-espresso/80")}>{variant}</p>}
          </div>
          <p className="shrink-0 font-semibold">{formatPrice(line.price * line.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className={cn("flex items-center rounded-full border", dark ? "border-white/15" : "border-charcoal/15")}>
            <button
              onClick={() => (line.quantity > 1 ? setQuantity(line.key, line.quantity - 1) : remove(line.key))}
              className="grid size-9 place-items-center rounded-full transition hover:bg-blush/20"
              aria-label={`Decrease quantity of ${line.name}`}
            >
              <MinusIcon width={16} height={16} />
            </button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{line.quantity}</span>
            <button
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              className="grid size-9 place-items-center rounded-full transition hover:bg-blush/20"
              aria-label={`Increase quantity of ${line.name}`}
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>
          <button
            onClick={() => remove(line.key)}
            className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase transition", dark ? "text-mist hover:text-blush" : "text-taupe hover:text-rouge")}
          >
            <TrashIcon width={15} height={15} /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
