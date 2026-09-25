"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { ProductImage } from "@/components/ui/ProductImage";
import { CloseIcon } from "@/components/ui/Icons";
import { OptionChips, autoPick } from "./VariantPicker";

/** Bottom sheet (mobile) / modal (desktop) to choose size & colour from a product card. */
export function QuickAdd({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart();
  const [size, setSize] = useState(autoPick(product.sizes));
  const [color, setColor] = useState(autoPick(product.colors));
  const [tried, setTried] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const missingSize = product.sizes.length > 0 && !size;
  const missingColor = product.colors.length > 0 && !color;

  const submit = () => {
    setTried(true);
    if (missingSize || missingColor) return;
    add(product, { size, color });
    onClose();
  };

  // Portal to <body> so the fixed sheet is never trapped by an animated (transformed) parent.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal aria-label={`Choose options for ${product.name}`}>
      <button className="animate-fade absolute inset-0 bg-ink/60 backdrop-blur-[2px]" onClick={onClose} aria-label="Close" />
      <div className="animate-sheet relative w-full max-w-lg rounded-t-3xl bg-cream p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] text-charcoal shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-charcoal/15 sm:hidden" />
        <button onClick={onClose} className="absolute top-4 right-4 grid size-10 place-items-center rounded-full hover:bg-charcoal/5" aria-label="Close">
          <CloseIcon />
        </button>
        <div className="flex gap-4 pr-10">
          <ProductImage src={product.images[0]} alt={product.name} className="aspect-[4/5] w-24 shrink-0 rounded-lg" eager />
          <div className="min-w-0">
            <p className="code-label text-taupe">{product.code}</p>
            <p className="mt-1 font-medium leading-snug">{product.name}</p>
            <p className="mt-2 text-lg font-semibold">{formatPrice(product.price)}</p>
            <Link href={`/product/${product.slug}`} className="mt-1 inline-block text-xs text-taupe underline underline-offset-4">
              View full details
            </Link>
          </div>
        </div>
        <div className="mt-6 space-y-5">
          <OptionChips label="Size" options={product.sizes} value={size} onChange={setSize} error={tried && missingSize} />
          <OptionChips label="Colour" options={product.colors} value={color} onChange={setColor} error={tried && missingColor} />
        </div>
        <button onClick={submit} className="btn btn-dark mt-7 w-full">
          Add to cart
        </button>
      </div>
    </div>,
    document.body,
  );
}
