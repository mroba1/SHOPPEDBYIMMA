"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES, formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import { setOrderStatus, setPaymentStatus } from "@/lib/actions/orders";
import { toWhatsappNumber, whatsappLink } from "@/lib/whatsapp";
import { site } from "@/lib/config";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";
import { ArrowLeft, ArrowUpRight, CheckCircle, CheckIcon, ClockIcon, CopyIcon, TruckIcon, WalletIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { PaymentBadge, StatusBadge } from "./StatusBadge";

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderDetails({ order }: { order: Order }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const cancelled = order.status === "CANCELLED";
  const paid = order.paymentStatus === "CONFIRMED";

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const changeStatus = (s: OrderStatus) => start(() => setOrderStatus(order.code, s));
  const togglePayment = () => start(() => setPaymentStatus(order.code, paid ? "PENDING" : "CONFIRMED"));

  const customerWa = toWhatsappNumber(order.customer.whatsapp);
  const first = order.customer.name.split(" ")[0];
  const itemsList = order.items.map((i) => `• ${i.name} (${i.productCode})${i.size ? `, ${i.size}` : ""} × ${i.quantity}`).join("\n");
  const templates = [
    {
      label: "Items available — send payment details",
      text: `Hi ${first} 👋\n\nThank you for your order ${order.code}! All your items are available:\n\n${itemsList}\n\nTotal: ${formatPrice(order.total)}\n\nPlease make payment to:\n[Bank name]\n[Account number]\n[Account name]\n\nSend your receipt here once done. 💕`,
    },
    { label: "Item unavailable", text: `Hi ${first} 👋\n\nAbout order ${order.code}: unfortunately one of your items is currently out of stock. Would you like a similar alternative or should I remove it?` },
    { label: "Payment received", text: `Hi ${first}, payment for order ${order.code} has been received. Thank you! 🎉 I'll update you once it ships.` },
    { label: "Order shipped", text: `Hi ${first}, great news! Your order ${order.code} is on its way to:\n${order.customer.address}\n\nThank you for shopping with ${site.name} 💕` },
  ];

  return (
    <div className={cn("transition-opacity", pending && "opacity-70")}>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
        <ArrowLeft width={16} height={16} /> All orders
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-charcoal p-6 text-cream sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-blush">Order</p>
          <button onClick={() => copy(order.code)} className="group mt-1 flex items-center gap-3 text-left" title="Copy order code">
            <h1 className="font-mono text-3xl font-semibold tracking-wider sm:text-5xl">#{order.code}</h1>
            <span className="rounded-full bg-white/10 p-2 text-nude transition group-hover:bg-blush group-hover:text-charcoal">
              {copied === order.code ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
            </span>
          </button>
          <p className="mt-2 text-sm text-mist">
            Placed {formatDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs tracking-[0.12em] text-mist uppercase">Payment</span>
          <span className="rounded-full bg-cream p-0.5"><PaymentBadge status={order.paymentStatus} /></span>
          <span className="ml-2 text-xs tracking-[0.12em] text-mist uppercase">Status</span>
          <span className="rounded-full bg-cream p-0.5"><StatusBadge status={order.status} /></span>
        </div>
      </div>

      {/* Progress */}
      {!cancelled && (
        <ol className="no-scrollbar mt-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 ring-1 ring-charcoal/8">
          {FLOW.map((s, i) => {
            const idx = FLOW.indexOf(order.status);
            const done = i <= idx;
            return (
              <li key={s} className={cn("flex min-w-28 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold", done ? "bg-blush/45 text-charcoal" : "text-taupe", i === idx && "bg-blush")}>
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[0.6rem]", done ? "bg-charcoal text-cream" : "ring-1 ring-taupe/40")}>
                  {done ? <CheckIcon width={11} height={11} /> : i + 1}
                </span>
                {orderStatusLabel[s]}
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        {/* Items */}
        <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-7">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl italic">Items ordered</h2>
            <span className="text-xs tracking-[0.12em] text-taupe uppercase">Match these exactly</span>
          </div>
          <ul className="mt-5 space-y-4">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex flex-col gap-4 rounded-2xl bg-cream/70 p-3 ring-1 ring-charcoal/6 sm:flex-row sm:p-4">
                <a href={item.image} target="_blank" rel="noopener" className="block shrink-0 overflow-hidden rounded-xl sm:w-40" title="Open full-size image">
                  <ProductImage src={item.image} alt={item.name} className="aspect-[4/5] w-full transition-transform duration-500 hover:scale-105" eager />
                </a>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-lg leading-snug font-semibold">{item.name}</p>
                  <button onClick={() => copy(item.productCode)} className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-charcoal px-2.5 py-1 font-mono text-sm tracking-wider text-cream" title="Copy product code">
                    {item.productCode}
                    {copied === item.productCode ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} className="text-mist" />}
                  </button>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                    <Spec label="Size" value={item.size ?? "—"} strong />
                    <Spec label="Colour" value={item.color ?? "—"} strong />
                    <Spec label="Qty" value={String(item.quantity)} strong />
                    <Spec label="Unit price" value={formatPrice(item.unitPrice)} />
                  </dl>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <Link href={`/product/${item.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.1em] text-taupe uppercase hover:text-charcoal">
                      View in store <ArrowUpRight width={14} height={14} />
                    </Link>
                    <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-charcoal/10 pt-5">
            <span className="text-xs font-bold tracking-[0.16em] uppercase">Total</span>
            <span className="text-3xl font-semibold">{formatPrice(order.total)}</span>
          </div>
        </section>

        <div className="space-y-6">
          {/* Next step */}
          <section className="rounded-3xl bg-blush/45 p-5 ring-1 ring-blush-deep/30 sm:p-6">
            <p className="eyebrow">Next step</p>
            <NextStep order={order} onStatus={changeStatus} onPayment={togglePayment} pending={pending} />
          </section>

          {/* Customer */}
          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Customer</p>
            <p className="mt-2 text-xl font-semibold">{order.customer.name}</p>
            <a href={`tel:${order.customer.whatsapp}`} className="mt-0.5 block font-mono text-sm text-espresso">{order.customer.whatsapp}</a>
            <a href={whatsappLink(`Hi ${first} 👋 This is Imma from ${site.name}, about your order ${order.code}.`, customerWa)} target="_blank" rel="noopener" className="btn btn-dark mt-4 w-full !min-h-11 !text-[0.7rem]">
              <WhatsAppIcon width={17} height={17} /> Message on WhatsApp
            </a>
            <div className="mt-5 border-t border-charcoal/8 pt-4">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-taupe uppercase"><TruckIcon width={16} height={16} /> Delivery</p>
              <p className="mt-1.5 text-sm leading-relaxed">{order.customer.address}</p>
              {order.customer.note && (
                <p className="mt-3 rounded-xl bg-linen px-3 py-2 text-sm text-espresso">
                  <span className="font-semibold">Note: </span>
                  {order.customer.note}
                </p>
              )}
            </div>
          </section>

          {/* Manual controls */}
          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Update order</p>
            <label className="mt-4 block text-xs font-semibold tracking-[0.1em] uppercase" htmlFor="status">Order status</label>
            <select
              id="status"
              value={order.status}
              disabled={pending}
              onChange={(e) => changeStatus(e.target.value as OrderStatus)}
              className="mt-2 w-full rounded-xl border border-charcoal/15 bg-cream px-3 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-blush/50"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{orderStatusLabel[s]}</option>
              ))}
            </select>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-cream px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Payment received</p>
                <p className="text-xs text-taupe">{paid ? "Customer has paid" : "Waiting for customer"}</p>
              </div>
              <button
                role="switch"
                aria-checked={paid}
                aria-label="Payment received"
                disabled={pending}
                onClick={togglePayment}
                className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", paid ? "bg-charcoal" : "bg-nude")}
              >
                <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-cream shadow transition-transform", paid && "translate-x-5 bg-blush")} />
              </button>
            </div>
          </section>

          {/* WhatsApp replies */}
          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Quick WhatsApp replies</p>
            <ul className="mt-3 space-y-2">
              {templates.map((t) => (
                <li key={t.label}>
                  <a href={whatsappLink(t.text, customerWa)} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ring-1 ring-charcoal/8 transition hover:bg-blush/20">
                    <span className="flex items-center gap-2"><WhatsAppIcon width={16} height={16} className="text-espresso" /> {t.label}</span>
                    <ArrowUpRight width={15} height={15} className="text-taupe" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* History */}
          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Timeline</p>
            <ol className="mt-4 space-y-4 border-l border-charcoal/10 pl-5">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className={cn("absolute top-1 -left-[1.62rem] size-2.5 rounded-full ring-4 ring-white", i === 0 ? "bg-blush-deep" : "bg-nude")} />
                  <p className="text-sm font-medium">{h.label}</p>
                  <p className="text-xs text-taupe">{formatDate(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-[0.65rem] font-semibold tracking-[0.14em] text-taupe uppercase">{label}</dt>
      <dd className={cn("mt-0.5", strong ? "text-base font-semibold" : "")}>{value}</dd>
    </div>
  );
}

function NextStep({ order, onStatus, onPayment, pending }: { order: Order; onStatus: (s: OrderStatus) => void; onPayment: () => void; pending: boolean }) {
  const btn = "btn btn-dark mt-4 w-full !min-h-12 !text-[0.7rem] disabled:opacity-60";
  const paid = order.paymentStatus === "CONFIRMED";

  const step = (() => {
    switch (order.status) {
      case "PENDING":
        return { icon: ClockIcon, title: "Check availability on SHEIN", body: "If every item is in stock, confirm the order and send the customer your payment details.", action: () => onStatus("CONFIRMED"), cta: "Items available — confirm order" };
      case "CONFIRMED":
        return paid
          ? { icon: CheckCircle, title: "Payment received", body: "Start sourcing the items.", action: () => onStatus("PROCESSING"), cta: "Start processing" }
          : { icon: WalletIcon, title: "Waiting for payment", body: "Once the customer's transfer lands, mark the payment as confirmed.", action: onPayment, cta: "Mark payment confirmed" };
      case "PAYMENT_CONFIRMED":
        return { icon: CheckCircle, title: "Paid — time to order", body: "Place the SHEIN order and mark this as processing.", action: () => onStatus("PROCESSING"), cta: "Start processing" };
      case "PROCESSING":
        return { icon: TruckIcon, title: "Being processed", body: "When the package is on its way to the customer, mark it shipped.", action: () => onStatus("SHIPPED"), cta: "Mark as shipped" };
      case "SHIPPED":
        return { icon: TruckIcon, title: "On the way", body: "Mark delivered once the customer receives it.", action: () => onStatus("DELIVERED"), cta: "Mark as delivered" };
      case "DELIVERED":
        return { icon: CheckCircle, title: "Delivered", body: "This order is complete. 🎉", action: null, cta: "" };
      case "CANCELLED":
        return { icon: ClockIcon, title: "Cancelled", body: "This order was cancelled. Reopen it by setting the status back to Pending.", action: () => onStatus("PENDING"), cta: "Reopen order" };
    }
  })();

  const Icon = step.icon;
  return (
    <div className="mt-3">
      <p className="flex items-center gap-2 text-lg font-semibold"><Icon width={20} height={20} /> {step.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-espresso/85">{step.body}</p>
      {step.action && (
        <button onClick={step.action} disabled={pending} className={btn}>
          {pending ? "Saving…" : step.cta}
        </button>
      )}
      {order.status === "PENDING" && (
        <button onClick={() => onStatus("CANCELLED")} disabled={pending} className="mt-3 w-full text-xs font-semibold tracking-[0.12em] text-rouge uppercase hover:underline">
          Cancel order
        </button>
      )}
    </div>
  );
}
