"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useCart } from "./CartProvider";
import { CartItem } from "./CartItem";
import { ArrowRight, BagIcon, CloseIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { ProductImage } from "@/components/ui/ProductImage";

export function CartDrawer() {
  const { lines, count, total, drawerOpen, closeDrawer } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={cn("fixed inset-0 z-50", drawerOpen ? "visible" : "invisible")} aria-hidden={!drawerOpen}>
      <button
        aria-label="Close cart"
        onClick={closeDrawer}
        className={cn("absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity duration-500", drawerOpen ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Your cart"
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-cream text-charcoal shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          drawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4">
          <div>
            <p className="font-serif text-2xl italic">Your cart</p>
            <p className="text-xs tracking-[0.14em] text-taupe uppercase">{count} item{count === 1 ? "" : "s"}</p>
          </div>
          <button onClick={closeDrawer} className="grid size-11 place-items-center rounded-full hover:bg-charcoal/5" aria-label="Close cart">
            <CloseIcon width={22} height={22} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-blush/40">
              <BagIcon width={30} height={30} />
            </div>
            <p className="font-serif mt-6 text-3xl italic">Your cart is empty</p>
            <p className="mt-2 text-sm text-taupe">Add a few favourites and they&apos;ll wait for you here.</p>
            <Link href="/shop" onClick={closeDrawer} className="btn btn-dark mt-8">
              Start shopping <ArrowRight width={18} height={18} />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-charcoal/10 overflow-y-auto px-5">
              {lines.map((l) => (
                <CartItem key={l.key} line={l} onNavigate={closeDrawer} />
              ))}
            </ul>
            <div className="border-t border-charcoal/10 bg-linen/60 px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              <div className="flex items-baseline justify-between">
                <span className="text-sm tracking-[0.14em] uppercase">Subtotal</span>
                <span className="text-xl font-semibold">{formatPrice(total)}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-taupe">
                <WhatsAppIcon width={14} height={14} /> No payment here. You&apos;ll confirm &amp; pay on WhatsApp.
              </p>
              <Link href="/checkout" onClick={closeDrawer} className="btn btn-dark mt-4 w-full">
                Proceed to checkout <ArrowRight width={18} height={18} />
              </Link>
              <Link href="/cart" onClick={closeDrawer} className="mt-3 block text-center text-xs font-semibold tracking-[0.14em] text-espresso uppercase underline-offset-4 hover:underline">
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/** "Added to cart" confirmation that slides up from the bottom. */
export function AddedToast() {
  const { toast, openDrawer, dismissToast } = useCart();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 flex justify-center px-4 lg:bottom-8" aria-live="polite">
      {toast && (
        <div key={toast.id} className="animate-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-charcoal p-3 pr-4 text-cream shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] ring-1 ring-blush/20">
          <ProductImage src={toast.image} alt="" className="size-14 shrink-0 rounded-lg" eager />
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-blush uppercase">Added to cart</p>
            <p className="truncate text-sm font-medium">{toast.name}</p>
            {toast.detail && <p className="truncate text-xs text-mist">{toast.detail}</p>}
          </div>
          <button onClick={openDrawer} className="shrink-0 rounded-full bg-blush px-3.5 py-2 text-xs font-bold tracking-[0.1em] text-charcoal uppercase">
            View cart
          </button>
          <button onClick={dismissToast} aria-label="Dismiss" className="-mr-1 shrink-0 text-mist hover:text-cream">
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}
    </div>
  );
}
