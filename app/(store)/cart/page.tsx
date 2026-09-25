"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { CartItem } from "@/components/cart/CartItem";
import { ArrowLeft, ArrowRight, BagIcon, ShieldIcon, WhatsAppIcon } from "@/components/ui/Icons";

export default function CartPage() {
  const { lines, count, total, ready } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-6 lg:px-10 lg:pt-16">
      <h1 className="text-5xl leading-none font-light sm:text-6xl">
        Your <span className="font-serif text-[1.12em] italic">cart</span>
      </h1>
      {ready && <p className="mt-3 text-sm tracking-[0.12em] text-taupe uppercase">{count} item{count === 1 ? "" : "s"}</p>}

      {!ready ? (
        <div className="mt-10 h-64 animate-pulse rounded-3xl bg-linen" />
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="grid size-20 place-items-center rounded-full bg-blush/45"><BagIcon width={30} height={30} /></div>
          <p className="font-serif mt-6 text-3xl italic">Nothing here yet</p>
          <p className="mt-2 text-taupe">Your next favourite thing is a tap away.</p>
          <Link href="/shop" className="btn btn-dark mt-8">Start shopping <ArrowRight width={18} height={18} /></Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
          <div>
            <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10">
              {lines.map((l) => (
                <CartItem key={l.key} line={l} />
              ))}
            </ul>
            <Link href="/shop" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
              <ArrowLeft width={16} height={16} /> Continue shopping
            </Link>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-charcoal/8">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatPrice(total)}</span></div>
                <div className="flex justify-between text-espresso/75"><span>Delivery</span><span>Confirmed on WhatsApp</span></div>
              </div>
              <div className="mt-4 flex items-baseline justify-between border-t border-charcoal/10 pt-4">
                <span className="text-xs font-bold tracking-[0.16em] uppercase">Total</span>
                <span className="text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout" className="btn btn-dark mt-6 hidden w-full sm:flex">
                Proceed to checkout <ArrowRight width={18} height={18} />
              </Link>
              <div className="mt-5 space-y-2.5 text-xs text-espresso/80">
                <p className="flex gap-2"><ShieldIcon width={16} height={16} className="shrink-0" /> No card or payment details needed here.</p>
                <p className="flex gap-2"><WhatsAppIcon width={16} height={16} className="shrink-0" /> You&apos;ll confirm availability &amp; pay on WhatsApp.</p>
              </div>
            </div>
          </aside>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/10 bg-cream/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md sm:hidden">
            <Link href="/checkout" className="btn btn-dark w-full">
              Proceed to checkout · {formatPrice(total)}
            </Link>
          </div>
          <div className="h-16 sm:hidden" aria-hidden />
        </div>
      )}
    </div>
  );
}
