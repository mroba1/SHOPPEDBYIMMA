"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminLogout } from "@/lib/actions/admin-auth";
import { cn } from "@/lib/cn";
import { site } from "@/lib/config";
import {
  ArrowLeft,
  BoxIcon,
  CloseIcon,
  GridIcon,
  LogoutIcon,
  MenuIcon,
  ReceiptIcon,
  SearchIcon,
  SettingsIcon,
  StoreIcon,
  TagIcon,
  UsersIcon,
} from "@/components/ui/Icons";

const SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: GridIcon },
      { href: "/admin/orders", label: "Orders", icon: ReceiptIcon, badge: true },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/products", label: "Products", icon: BoxIcon },
      { href: "/admin/categories", label: "Categories", icon: TagIcon },
      { href: "/admin/customers", label: "Customers", icon: UsersIcon },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: SettingsIcon }],
  },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function AdminSidebar({ admin, pendingCount }: { admin: { name: string; email: string }; pendingCount: number }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try {
      // Saved UI preference, read after mount (localStorage isn't available on the server)
      setCollapsed(localStorage.getItem("sbi-admin-collapsed") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("sbi-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const nav = (compact: boolean, onNavigate?: () => void) => (
    <nav className="flex-1 space-y-6 overflow-y-auto">
      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className={cn("mb-2 px-3 text-[0.62rem] font-bold tracking-[0.18em] text-taupe uppercase", compact && "text-center px-0")}>
            {compact ? section.label[0] : section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    title={compact ? label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      compact && "justify-center px-0",
                      active ? "bg-blush text-charcoal" : "text-espresso hover:bg-linen",
                    )}
                  >
                    <Icon width={19} height={19} />
                    {!compact && label}
                    {badge && pendingCount > 0 && (
                      <span
                        className={cn(
                          "rounded-full text-[0.62rem] font-bold",
                          compact ? "absolute top-1 right-2 size-2 bg-rouge" : "ml-auto bg-charcoal px-2 py-0.5 text-cream",
                        )}
                      >
                        {!compact && pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const profile = (compact: boolean, onNavigate?: () => void) => (
    <div className="space-y-1 border-t border-charcoal/8 pt-4">
      <Link
        href="/admin/settings"
        onClick={onNavigate}
        className={cn("flex items-center gap-3 rounded-xl p-2 transition hover:bg-linen", compact && "justify-center")}
        title={compact ? `${admin.name} · Settings` : undefined}
      >
        <span className="font-serif grid size-10 shrink-0 place-items-center rounded-full bg-charcoal text-base text-blush italic">{initials(admin.name)}</span>
        {!compact && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{admin.name}</span>
            <span className="block truncate text-xs text-taupe">Store owner</span>
          </span>
        )}
      </Link>
      <form action={adminLogout}>
        <button className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-espresso transition hover:bg-rouge/8 hover:text-rouge", compact && "justify-center px-0")} title="Log out">
          <LogoutIcon width={19} height={19} /> {!compact && "Log out"}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop / laptop sidebar */}
      <aside className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-charcoal/8 bg-white/80 py-6 transition-[width] duration-300 lg:flex", collapsed ? "w-20 px-3" : "w-64 px-4")}>
        <div className={cn("mb-8 flex items-center", collapsed ? "justify-center" : "justify-between px-2")}>
          {!collapsed && (
            <Link href="/admin/dashboard">
              <span className="font-display block text-[0.85rem] tracking-[0.22em]">{site.wordmark}</span>
              <span className="font-script block text-lg leading-none text-blush-deep">seller studio</span>
            </Link>
          )}
          <button onClick={toggle} className="grid size-8 place-items-center rounded-lg text-taupe ring-1 ring-charcoal/10 hover:bg-linen hover:text-charcoal" aria-label={collapsed ? "Expand menu" : "Collapse menu"}>
            <ArrowLeft width={15} height={15} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        {nav(collapsed)}
        <Link href="/" target="_blank" className={cn("mb-3 flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-taupe hover:text-charcoal", collapsed && "justify-center px-0")} title="View store">
          <StoreIcon width={17} height={17} /> {!collapsed && "View store"}
        </Link>
        {profile(collapsed)}
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-charcoal/8 bg-cream/95 px-3 pt-[env(safe-area-inset-top,0px)] backdrop-blur lg:hidden">
        <button onClick={() => setDrawer(true)} className="grid size-11 place-items-center rounded-full hover:bg-linen" aria-label="Open menu">
          <MenuIcon width={22} height={22} />
        </button>
        <Link href="/admin/dashboard" className="text-center leading-none">
          <span className="font-display block text-[0.75rem] tracking-[0.2em]">{site.wordmark}</span>
          <span className="font-script text-base text-blush-deep">seller studio</span>
        </Link>
        <Link href="/admin/dashboard#find" className="grid size-11 place-items-center rounded-full bg-charcoal text-cream" aria-label="Find an order">
          <SearchIcon width={19} height={19} />
        </Link>
      </header>

      {/* Phone / tablet drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", drawer ? "visible" : "invisible")} aria-hidden={!drawer}>
        <button className={cn("absolute inset-0 bg-ink/50 transition-opacity", drawer ? "opacity-100" : "opacity-0")} onClick={() => setDrawer(false)} aria-label="Close menu" />
        <aside className={cn("absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-cream px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-transform duration-300", drawer ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-6 flex items-center justify-between px-2">
            <span>
              <span className="font-display block text-[0.8rem] tracking-[0.22em]">{site.wordmark}</span>
              <span className="font-script text-lg text-blush-deep">seller studio</span>
            </span>
            <button onClick={() => setDrawer(false)} className="grid size-10 place-items-center rounded-full hover:bg-linen" aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
          {nav(false, () => setDrawer(false))}
          <Link href="/" target="_blank" className="mb-3 flex items-center gap-3 px-3 py-2 text-xs text-taupe">
            <StoreIcon width={17} height={17} /> View store
          </Link>
          {profile(false, () => setDrawer(false))}
        </aside>
      </div>
    </>
  );
}
