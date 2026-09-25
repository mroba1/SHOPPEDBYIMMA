"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCart } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ui/ProductImage";
import { CheckIcon, PlusIcon } from "@/components/ui/Icons";
import { QuickAdd } from "./QuickAdd";

export function ProductCard({ product, tone = "light", priority }: { product: Product; tone?: "light" | "dark"; priority?: boolean }) {
  const { add } = useCart();
  const [picking, setPicking] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const dark = tone === "dark";
  const needsChoice = product.sizes.length > 1 || product.colors.length > 1;

  const onAdd = () => {
    if (!product.available) return;
    if (needsChoice) return setPicking(true);
    add(product, { size: product.sizes[0], color: product.colors[0] });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-[2px]" aria-label={product.name}>
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          eager={priority}
          className={cn(
            "aspect-[4/5] w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.045]",
            !product.available && "grayscale-[60%]",
          )}
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {!product.available && <span className="rounded-full bg-charcoal/85 px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.14em] text-cream uppercase">Sold out</span>}
          {product.available && product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="rounded-full bg-blush px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.14em] text-charcoal uppercase">
              −{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3.5">
        <p className={cn("code-label", dark ? "text-mist" : "text-taupe")}>{product.code}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 text-[0.95rem] leading-snug font-medium hover:underline sm:text-base">
          {product.name}
        </Link>
        <p className="mt-1.5 flex items-baseline gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={cn("text-sm line-through", dark ? "text-mist" : "text-taupe")}>{formatPrice(product.compareAtPrice)}</span>
          )}
        </p>
        <button
          onClick={onAdd}
          disabled={!product.available}
          className={cn(
            "mt-3.5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border text-[0.7rem] font-bold tracking-[0.16em] uppercase transition-all duration-300 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45",
            justAdded
              ? "border-blush bg-blush text-charcoal"
              : dark
                ? "border-blush/40 text-cream hover:border-blush hover:bg-blush hover:text-charcoal"
                : "border-charcoal/25 hover:border-charcoal hover:bg-charcoal hover:text-cream",
          )}
        >
          {justAdded ? (
            <>
              <CheckIcon width={16} height={16} /> Added
            </>
          ) : product.available ? (
            <>
              <PlusIcon width={15} height={15} /> Add to cart
            </>
          ) : (
            "Sold out"
          )}
        </button>
      </div>

      {picking && <QuickAdd product={product} onClose={() => setPicking(false)} />}
    </article>
  );
}

export function ProductGrid({ products, tone, className }: { products: Product[]; tone?: "light" | "dark"; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-3.5 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <div key={p.id} className="reveal" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <ProductCard product={p} tone={tone} priority={i < 4} />
        </div>
      ))}
    </div>
  );
}
