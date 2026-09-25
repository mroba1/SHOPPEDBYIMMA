import Link from "next/link";
import { getStats, listOrders, listProducts } from "@/lib/data/repo";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { ArrowRight, BoxIcon, CheckCircle, ClockIcon, ReceiptIcon, TruckIcon, WalletIcon } from "@/components/ui/Icons";

export default async function DashboardPage() {
  const [stats, orders, products] = await Promise.all([getStats(), listOrders(), listProducts()]);
  const soldOut = products.filter((p) => !p.available).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const cards = [
    { label: "Total orders", value: stats.total, icon: ReceiptIcon, tone: "light" },
    { label: "Pending", value: stats.pending, icon: ClockIcon, tone: "blush", hint: "Check availability" },
    { label: "Awaiting payment", value: stats.awaitingPayment, icon: WalletIcon, tone: "light", hint: "Confirmed, not paid" },
    { label: "Paid orders", value: stats.paid, icon: CheckCircle, tone: "light" },
    { label: "Processing", value: stats.processing, icon: BoxIcon, tone: "light" },
    { label: "Delivered", value: stats.delivered, icon: TruckIcon, tone: "dark" },
  ] as const;

  return (
    <div>
      {/* Order lookup — the #1 job of this dashboard */}
      <section className="relative overflow-hidden rounded-3xl bg-charcoal p-6 text-cream sm:p-10">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative">
          <p className="font-script text-2xl text-blush">{greeting}, Imma</p>
          <h1 className="mt-1 text-3xl leading-tight font-light sm:text-4xl">
            Got a code on WhatsApp? <span className="font-serif text-[1.12em] italic">Find it here.</span>
          </h1>
          <div className="mt-6 max-w-2xl">
            <OrderSearch />
          </div>
          <p className="mt-3 text-xs text-mist">Tip: you can type just the last 5 characters, e.g. 7K42P.</p>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={cn(
              "rounded-2xl p-4 ring-1 sm:p-5",
              c.tone === "blush" && "bg-blush ring-blush-deep/30",
              c.tone === "dark" && "bg-espresso text-cream ring-espresso",
              c.tone === "light" && "bg-white ring-charcoal/8",
            )}
          >
            <c.icon width={20} height={20} className={c.tone === "dark" ? "text-blush" : "text-espresso"} />
            <p className="mt-4 text-3xl font-semibold tabular-nums">{c.value}</p>
            <p className="mt-0.5 text-xs font-semibold tracking-[0.08em] uppercase opacity-80">{c.label}</p>
            {"hint" in c && <p className="mt-1 text-[0.7rem] opacity-60">{c.hint}</p>}
          </div>
        ))}
      </section>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center justify-between rounded-2xl bg-linen px-5 py-4">
          <span className="text-sm text-espresso">Confirmed revenue</span>
          <span className="text-lg font-semibold">{formatPrice(stats.revenue)}</span>
        </div>
        <Link href="/admin/products" className="flex flex-1 items-center justify-between rounded-2xl bg-linen px-5 py-4 transition hover:bg-blush/40">
          <span className="text-sm text-espresso">{products.length} products · {soldOut} sold out</span>
          <ArrowRight width={18} height={18} />
        </Link>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-light">
            Recent <span className="font-serif text-[1.15em] italic">orders</span>
          </h2>
          <Link href="/admin/orders" className="text-xs font-bold tracking-[0.14em] uppercase hover:underline">View all</Link>
        </div>
        <AdminOrderTable orders={orders.slice(0, 6)} showFilters={false} />
      </section>
    </div>
  );
}
