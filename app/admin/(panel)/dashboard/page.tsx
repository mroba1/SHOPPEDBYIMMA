import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { getStats, listOrders } from "@/lib/data/repo";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArrowRight, BoxIcon, CheckCircle, ClockIcon, ReceiptIcon, TruckIcon, WalletIcon } from "@/components/ui/Icons";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [admin, stats, orders] = await Promise.all([getCurrentAdmin(), getStats(), listOrders()]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  const needsAttention = orders.filter((o) => o.status === "PENDING" || o.status === "AWAITING_PAYMENT");

  const cards = [
    { label: "Total orders", value: stats.total, icon: ReceiptIcon, href: "/admin/orders", tone: "dark" },
    { label: "Pending", value: stats.pending, icon: ClockIcon, href: "/admin/orders?status=PENDING", tone: stats.pending ? "blush" : "light", hint: "Check availability" },
    { label: "Awaiting payment", value: stats.awaitingPayment, icon: WalletIcon, href: "/admin/orders?status=AWAITING_PAYMENT", tone: "light", hint: "Payment details sent" },
    { label: "Payment confirmed", value: stats.paymentConfirmed, icon: CheckCircle, href: "/admin/orders?status=PAYMENT_CONFIRMED", tone: "light", hint: "Ready to order" },
    { label: "Processing", value: stats.processing, icon: BoxIcon, href: "/admin/orders?status=PROCESSING", tone: "light" },
    { label: "Shipped", value: stats.shipped, icon: TruckIcon, href: "/admin/orders?status=SHIPPED", tone: "light" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle, href: "/admin/orders?status=DELIVERED", tone: "light" },
  ] as const;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting}, ${admin?.name.split(" ")[0] ?? "Imma"}`}
        description="Here's what's happening in your shop."
        actions={<span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-espresso ring-1 ring-charcoal/10">{today}</span>}
      />

      {/* ── FIND CUSTOMER ORDER: the first and biggest thing on the page ── */}
      <section id="find" className="relative scroll-mt-20 overflow-hidden rounded-[2rem] bg-charcoal px-5 py-10 text-cream sm:px-10 sm:py-14">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative text-center">
          <p className="eyebrow text-blush">Find customer order</p>
          <h2 className="mt-3 text-2xl leading-tight font-light sm:text-4xl">
            Got a code on WhatsApp? <span className="font-serif text-[1.12em] italic">Paste it here.</span>
          </h2>
          <div className="mt-8">
            <OrderSearch size="hero" />
          </div>
        </div>
      </section>

      {/* ── Status overview ── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-[0.12em] text-taupe uppercase">Orders at a glance</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {cards.map((c, i) => (
            <Link
              key={c.label}
              href={c.href}
              className={cn(
                "group rounded-2xl p-4 ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(41,40,35,0.45)] sm:p-5",
                i === 0 && "col-span-2 sm:col-span-1",
                c.tone === "dark" && "bg-charcoal text-cream ring-charcoal",
                c.tone === "blush" && "bg-blush ring-blush-deep/40",
                c.tone === "light" && "bg-white ring-charcoal/8",
              )}
            >
              <p className={cn("flex items-center gap-2 text-xs font-medium", c.tone === "dark" ? "text-nude" : "text-taupe", c.tone === "blush" && "text-espresso")}>
                <c.icon width={16} height={16} /> {c.label}
              </p>
              <p className="mt-3 text-[2rem] leading-none font-semibold tabular-nums">{c.value}</p>
              <p className={cn("mt-2 flex items-center gap-1 text-[0.7rem]", c.tone === "dark" ? "text-mist" : "text-taupe")}>
                {"hint" in c ? c.hint : "View orders"}
                <ArrowRight width={12} height={12} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm text-taupe">
          Confirmed payments so far: <strong className="font-semibold text-charcoal">{formatPrice(stats.revenue)}</strong>
        </p>
      </section>

      {needsAttention.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold">Needs your attention <span className="ml-1 rounded-full bg-blush px-2 py-0.5 text-xs">{needsAttention.length}</span></h2>
          </div>
          <AdminOrderTable orders={needsAttention} showFilters={false} />
        </section>
      )}

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-bold tracking-[0.14em] uppercase hover:underline">View all</Link>
        </div>
        <AdminOrderTable orders={orders.slice(0, 5)} showFilters={false} />
      </section>
    </div>
  );
}
