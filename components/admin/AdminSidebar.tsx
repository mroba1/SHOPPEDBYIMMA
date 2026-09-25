"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { site } from "@/lib/config";
import { BoxIcon, GridIcon, LogoutIcon, ReceiptIcon, StoreIcon, TagIcon, UsersIcon } from "@/components/ui/Icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: GridIcon, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ReceiptIcon },
  { href: "/admin/products", label: "Products", icon: BoxIcon },
  { href: "/admin/categories", label: "Categories", icon: TagIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
];

export function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-charcoal px-5 py-7 text-cream lg:flex">
        <Link href="/admin" className="px-3">
          <p className="font-display text-[0.95rem] font-light tracking-[0.22em]">{site.wordmark}</p>
          <p className="font-script mt-0.5 text-lg text-blush">seller studio</p>
        </Link>
        <nav className="mt-10 flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive(href, exact) ? "bg-blush text-charcoal" : "text-nude hover:bg-white/5 hover:text-cream",
              )}
            >
              <Icon width={19} height={19} />
              {label}
              {label === "Orders" && pendingCount > 0 && (
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-bold", isActive(href) ? "bg-charcoal text-blush" : "bg-blush text-charcoal")}>
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-5">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-nude transition hover:bg-white/5 hover:text-cream">
            <StoreIcon width={19} height={19} /> View store
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-nude transition hover:bg-white/5 hover:text-cream">
              <LogoutIcon width={19} height={19} /> Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile: top bar + scrollable tab strip */}
      <div className="sticky top-0 z-30 bg-charcoal text-cream lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-display text-sm font-light tracking-[0.2em]">{site.wordmark}</span>
            <span className="font-script text-base text-blush">studio</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="grid size-10 place-items-center rounded-full text-nude hover:bg-white/5" aria-label="View store">
              <StoreIcon />
            </Link>
            <form action={logout}>
              <button className="grid size-10 place-items-center rounded-full text-nude hover:bg-white/5" aria-label="Log out">
                <LogoutIcon />
              </button>
            </form>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
          {NAV.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.08em] transition",
                isActive(href, exact) ? "bg-blush text-charcoal" : "bg-white/5 text-nude",
              )}
            >
              {label}
              {label === "Orders" && pendingCount > 0 && <span className="ml-1.5 opacity-70">{pendingCount}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
