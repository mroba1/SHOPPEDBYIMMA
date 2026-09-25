"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";
import { SearchIcon } from "@/components/ui/Icons";
import { PaymentBadge, StatusBadge } from "./StatusBadge";

type Filter = "ALL" | "AWAITING_PAYMENT" | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { key: "PAYMENT_CONFIRMED", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const matches = (o: Order, f: Filter) =>
  f === "ALL" ? true : f === "AWAITING_PAYMENT" ? o.status === "CONFIRMED" && o.paymentStatus === "PENDING" : o.status === f;

export function AdminOrderTable({ orders, showFilters = true, initialFilter = "ALL" }: { orders: Order[]; showFilters?: boolean; initialFilter?: Filter }) {
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return orders.filter(
      (o) =>
        matches(o, filter) &&
        (!needle ||
          o.code.toLowerCase().includes(needle) ||
          o.customer.name.toLowerCase().includes(needle) ||
          (digits.length > 3 && o.customer.whatsapp.replace(/\D/g, "").includes(digits))),
    );
  }, [orders, filter, q]);

  return (
    <div>
      {showFilters && (
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {FILTERS.map((f) => {
              const n = orders.filter((o) => matches(o, f.key)).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                    filter === f.key ? "bg-charcoal text-cream" : "bg-white text-espresso ring-1 ring-charcoal/10 hover:ring-charcoal/30",
                  )}
                >
                  {f.label} <span className="ml-1 opacity-60">{n}</span>
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 rounded-full bg-white px-4 ring-1 ring-charcoal/10 focus-within:ring-2 focus-within:ring-blush lg:w-72">
            <SearchIcon width={17} height={17} className="text-taupe" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Code, name or phone" className="h-10 w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center ring-1 ring-charcoal/8">
          <p className="font-serif text-2xl italic">No orders here</p>
          <p className="mt-1 text-sm text-taupe">
            {q ? "Try a different code, name or number." : `No ${filter === "ALL" ? "" : orderStatusLabel[filter as OrderStatus]?.toLowerCase() ?? "matching"} orders yet.`}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-charcoal/8 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-charcoal/8 bg-linen/60 text-[0.68rem] tracking-[0.14em] text-taupe uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Items</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/6">
                {visible.map((o) => (
                  <tr key={o.id} className="group relative transition hover:bg-blush/12">
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${o.code}`} className="font-mono font-semibold tracking-wide after:absolute after:inset-0">
                        {o.code}
                      </Link>
                      <p className="mt-0.5 text-xs text-taupe">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{o.customer.name}</p>
                      <p className="text-xs text-taupe">{o.customer.whatsapp}</p>
                    </td>
                    <td className="px-5 py-4">
                      <ItemThumbs order={o} />
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-4"><PaymentBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.code}`} className="block rounded-2xl bg-white p-4 ring-1 ring-charcoal/8 active:bg-blush/15">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-semibold tracking-wide">{o.code}</p>
                      <p className="text-sm">{o.customer.name}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(o.total)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <ItemThumbs order={o} />
                    <p className="text-xs text-taupe">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.paymentStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ItemThumbs({ order }: { order: Order }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2.5">
        {order.items.slice(0, 3).map((i, idx) => (
          <ProductImage key={idx} src={i.image} alt={i.name} className="aspect-[4/5] w-8 rounded-md ring-2 ring-white" />
        ))}
      </div>
      <span className="text-xs text-taupe">{count} item{count === 1 ? "" : "s"}</span>
    </div>
  );
}
