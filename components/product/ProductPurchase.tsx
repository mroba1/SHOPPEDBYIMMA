"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { productEnquiryMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon, CheckIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { OptionChips, QuantityStepper, autoPick } from "./VariantPicker";

export function ProductPurchase({ product }: { product: Product }) {
  const { add, openDrawer } = useCart();
  const [size, setSize] = useState(autoPick(product.sizes));
  const [color, setColor] = useState(autoPick(product.colors));
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [added, setAdded] = useState(false);

  const missingSize = product.sizes.length > 0 && !size;
  const missingColor = product.colors.length > 0 && !color;

  const addToCart = () => {
    setTried(true);
    if (missingSize || missingColor) {
      document.getElementById("options")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add(product, { size, color, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const cta = (
    <button
      onClick={addToCart}
      disabled={!product.available}
      className={cn("btn w-full disabled:cursor-not-allowed disabled:opacity-50", added ? "btn-blush" : "btn-dark")}
    >
      {!product.available ? (
        "Sold out"
      ) : added ? (
        <>
          <CheckIcon width={18} height={18} /> Added to cart
        </>
      ) : (
        <>
          <BagIcon width={18} height={18} /> Add to cart · {formatPrice(product.price * qty)}
        </>
      )}
    </button>
  );

  return (
    <>
      <div id="options" className="space-y-6">
        <OptionChips label="Size" options={product.sizes} value={size} onChange={setSize} error={tried && missingSize} />
        <OptionChips label="Colour" options={product.colors} value={color} onChange={setColor} error={tried && missingColor} />
        {product.available && (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.16em] uppercase">Quantity</p>
            <QuantityStepper value={qty} onChange={setQty} />
          </div>
        )}
      </div>

      <div className="mt-8 hidden space-y-3 sm:block">
        {cta}
        {added && (
          <button onClick={openDrawer} className="animate-rise w-full text-center text-xs font-bold tracking-[0.14em] uppercase underline underline-offset-4">
            View cart &amp; checkout
          </button>
        )}
      </div>

      <a
        href={whatsappLink(productEnquiryMessage(product.name, product.code))}
        target="_blank"
        rel="noopener"
        className="mt-4 flex items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold tracking-[0.14em] text-espresso uppercase ring-1 ring-charcoal/15 transition hover:bg-white/60"
      >
        <WhatsAppIcon width={16} height={16} /> Ask about this item
      </a>

      {/* Sticky add-to-cart for phones */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/10 bg-cream/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:hidden">
        {cta}
      </div>
      <div className="h-24 sm:hidden" aria-hidden />
    </>
  );
}
