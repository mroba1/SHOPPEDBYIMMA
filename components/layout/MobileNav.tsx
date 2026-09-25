"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { whatsappLink, generalMessage } from "@/lib/whatsapp";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon, GridIcon, HomeIcon, WhatsAppIcon } from "@/components/ui/Icons";

// Thumb-reachable bottom bar for phones. Pages with their own sticky
// action bar (product, cart, checkout) hide it so the screen stays calm.
const HIDDEN_ON = [/^\/product\//, /^\/cart/, /^\/checkout/, /^\/order\//];

export function MobileNav() {
  const pathname = usePathname();
  const { count, openDrawer, bump } = useCart();
  if (HIDDEN_ON.some((r) => r.test(pathname))) return null;

  const item = "flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 text-[0.62rem] font-semibold tracking-[0.12em] uppercase";

  return (
    <>
      <div className="h-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:hidden" aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-charcoal/95 pb-[env(safe-area-inset-bottom,0px)] text-mist backdrop-blur-md lg:hidden"
        aria-label="Quick navigation"
      >
        <Link href="/" className={cn(item, pathname === "/" && "text-blush")}>
          <HomeIcon /> Home
        </Link>
        <Link href="/shop" className={cn(item, pathname.startsWith("/shop") && "text-blush")}>
          <GridIcon /> Shop
        </Link>
        <button onClick={openDrawer} className={cn(item, "relative")}>
          <span className="relative">
            <BagIcon />
            {count > 0 && (
              <span key={bump} className="animate-pop absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-blush px-1 text-[0.6rem] leading-4 font-bold text-charcoal">
                {count}
              </span>
            )}
          </span>
          Cart
        </button>
        <a href={whatsappLink(generalMessage)} target="_blank" rel="noopener" className={item}>
          <WhatsAppIcon /> WhatsApp
        </a>
      </nav>
    </>
  );
}
