"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { site } from "@/lib/config";
import { whatsappLink, generalMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { useCart } from "@/components/cart/CartProvider";
import { Wordmark } from "@/components/ui/Brand";
import { ArrowUpRight, BagIcon, CloseIcon, MenuIcon, UserIcon, WhatsAppIcon } from "@/components/ui/Icons";

export function Header({ categories, accountName }: { categories: Pick<Category, "slug" | "name">[]; accountName: string | null }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { count, openDrawer, bump } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const solid = !isHome || scrolled;

  return (
    <>
      <div className="bg-blush px-4 py-2 text-center text-[0.7rem] font-semibold tracking-[0.14em] text-charcoal uppercase">
        Order on the site · Confirm &amp; pay on WhatsApp
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 text-cream transition-[background-color,box-shadow,backdrop-filter] duration-500",
          "pt-[env(safe-area-inset-top,0px)]",
          solid ? "bg-charcoal/95 shadow-[0_1px_0_rgba(226,189,170,0.12)] backdrop-blur-md" : "bg-charcoal",
        )}
      >
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:h-20 lg:px-10">
          <div className="flex items-center gap-7">
            <button
              onClick={() => setMenuOpen(true)}
              className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <nav className="hidden items-center gap-7 text-[0.78rem] font-medium tracking-[0.16em] uppercase lg:flex">
              <NavLink href="/shop" active={pathname === "/shop"}>Shop all</NavLink>
              <NavLink href="/#categories" active={false}>Categories</NavLink>
              <NavLink href="/#how-it-works" active={false}>How it works</NavLink>
            </nav>
          </div>

          <Wordmark />

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <a
              href={whatsappLink(generalMessage)}
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-2 rounded-full border border-blush/30 px-4 py-2 text-[0.72rem] font-semibold tracking-[0.14em] uppercase transition hover:border-blush hover:text-blush md:inline-flex"
            >
              <WhatsAppIcon width={16} height={16} /> Chat
            </a>
            <Link
              href={accountName ? "/account" : "/account/login"}
              className="grid size-11 place-items-center rounded-full transition hover:bg-white/5"
              aria-label={accountName ? `My account (${accountName})` : "Sign in (optional)"}
              title={accountName ? "My account" : "Sign in (optional)"}
            >
              <UserIcon width={21} height={21} className={accountName ? "text-blush" : undefined} />
            </Link>
            <button
              onClick={openDrawer}
              className="relative -mr-2 grid size-11 place-items-center rounded-full transition hover:bg-white/5"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <BagIcon width={22} height={22} />
              {count > 0 && (
                <span
                  key={bump}
                  className="animate-pop absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-blush px-1 text-[0.65rem] leading-5 font-bold text-charcoal"
                >
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-charcoal text-cream transition-[opacity,visibility] duration-400 lg:hidden",
          menuOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex h-16 items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)]">
          <Wordmark />
          <button onClick={() => setMenuOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-white/5" aria-label="Close menu">
            <CloseIcon width={22} height={22} />
          </button>
        </div>
        <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto px-6 pt-8 pb-10">
          <p className="eyebrow text-blush">Shop by category</p>
          <ul className="mt-4 space-y-1">
            <li>
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="font-serif block py-1.5 text-4xl italic">Shop everything</Link>
            </li>
            {categories.map((c, i) => (
              <li key={c.slug} className={cn("transition-all duration-500", menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0")} style={{ transitionDelay: `${80 + i * 40}ms` }}>
                <Link href={`/shop/${c.slug}`} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-white/8 py-3.5 text-lg">
                  {c.name} <ArrowUpRight width={18} height={18} className="text-blush" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <Link href={accountName ? "/account" : "/account/login"} onClick={() => setMenuOpen(false)} className="mb-3 flex items-center justify-center gap-2 py-3 text-sm text-nude">
              <UserIcon width={18} height={18} /> {accountName ? "My account & orders" : "Sign in / create account (optional)"}
            </Link>
            <a href={whatsappLink(generalMessage)} target="_blank" rel="noopener" className="btn btn-blush w-full">
              <WhatsAppIcon width={18} height={18} /> Chat with Imma
            </a>
            <p className="mt-4 text-center text-sm text-mist">{site.whatsappDisplay}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("link-underline py-1 transition-colors hover:text-blush", active && "text-blush")}>
      {children}
    </Link>
  );
}
