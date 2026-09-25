"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Order, OrderStatus, PaymentStatus, StoreSettings } from "@/lib/types";
import { ORDER_STATUSES, formatDate, formatPrice, orderStatusLabel } from "@/lib/format";
import { setOrderStatus, setPaymentStatus } from "@/lib/actions/orders";
import { toWhatsappNumber, whatsappLink } from "@/lib/whatsapp";
import { site } from "@/lib/config";
import { cn } from "@/lib/cn";
import { ProductImage } from "@/components/ui/ProductImage";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  TruckIcon,
  WalletIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";
import { PaymentBadge, StatusBadge } from "./StatusBadge";

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "AWAITING_PAYMENT", "PAYMENT_CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderDetails({ order, settings }: { order: Order; settings: StoreSettings }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      setError(null);
      try {
        await fn();
      } catch {
        setError("Couldn't save that change. Check your connection and try again.");
      }
    });
  const changeStatus = (s: OrderStatus) => run(() => setOrderStatus(order.code, s));
  const changePayment = (p: PaymentStatus) => run(() => setPaymentStatus(order.code, p));

  const customerWa = toWhatsappNumber(order.customer.whatsapp);
  const first = order.customer.name.split(" ")[0];
  const itemsList = order.items
    .map((i) => `• ${i.name} (${i.productCode})${i.size ? `, size ${i.size}` : ""}${i.color ? `, ${i.color}` : ""} × ${i.quantity}`)
    .join("\n");
  const bank =
    settings.accountNumber && settings.bankName
      ? `${settings.bankName}\n${settings.accountNumber}\n${settings.accountName}`
      : "[Bank name]\n[Account number]\n[Account name]";
  const templates = [
    {
      label: "Items available — send payment details",
      text: `Hi ${first} 👋\n\nThank you for your order ${order.code}! All your items are available:\n\n${itemsList}\n\nTotal: ${formatPrice(order.total)}\n\nPlease make payment to:\n${bank}${settings.paymentNote ? `\n\n${settings.paymentNote}` : ""}\n\nSend your receipt here once done. 💕`,
    },
    { label: "An item is unavailable", text: `Hi ${first} 👋\n\nAbout order ${order.code}: unfortunately one of your items is currently out of stock. Would you like a similar alternative, or should I remove it?` },
    { label: "Payment received", text: `Hi ${first}, payment for order ${order.code} has been received. Thank you! 🎉 I'll update you once it ships.` },
    { label: "Order shipped", text: `Hi ${first}, great news! Your order ${order.code} is on its way to:\n${order.customer.address}\n\nThank you for shopping with ${site.name} 💕` },
  ];

  return (
    <div className={cn("transition-opacity", pending && "opacity-70")}>
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
        <ArrowLeft width={16} height={16} /> All orders
      </Link>

      {/* ── Header: code + the four facts the owner needs first ── */}
      <section className="mt-4 overflow-hidden rounded-3xl bg-charcoal text-cream">
        <div className="flex flex-col gap-4 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-blush">Order</p>
            <button onClick={() => copy(order.code)} className="group mt-1 flex items-center gap-3 text-left" title="Copy order code">
              <h1 className="font-mono text-[2rem] leading-none font-semibold tracking-wider sm:text-5xl">#{order.code}</h1>
              <span className="rounded-full bg-white/10 p-2 text-nude transition group-hover:bg-blush group-hover:text-charcoal">
                {copied === order.code ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
              </span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.14em] text-mist uppercase">
              Order <span className="rounded-full bg-cream p-0.5"><StatusBadge status={order.status} /></span>
            </span>
            <span className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.14em] text-mist uppercase">
              Payment <span className="rounded-full bg-cream p-0.5"><PaymentBadge status={order.paymentStatus} /></span>
            </span>
          </div>
        </div>
        <dl className="grid gap-px bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
          <Fact label="Customer" value={order.customer.name} />
          <Fact
            label="WhatsApp"
            value={
              <a href={whatsappLink(`Hi ${first} 👋 This is Imma from ${site.name}, about your order ${order.code}.`, customerWa)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 font-mono hover:text-blush">
                <WhatsAppIcon width={16} height={16} className="text-blush" /> {order.customer.whatsapp}
              </a>
            }
          />
          <Fact label="Delivery address" value={order.customer.address} />
          <Fact label="Order date" value={`${formatDate(order.createdAt, false)} · ${new Date(order.createdAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}`} />
        </dl>
        {order.customer.note && (
          <p className="border-t border-white/8 px-6 py-4 text-sm text-nude sm:px-8">
            <span className="font-semibold text-blush">Customer note: </span>
            {order.customer.note}
          </p>
        )}
      </section>

      {/* ── Progress ── */}
      {order.status !== "CANCELLED" && (
        <ol className="no-scrollbar mt-5 flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 ring-1 ring-charcoal/8">
          {FLOW.map((s, i) => {
            const idx = FLOW.indexOf(order.status);
            const done = i <= idx;
            return (
              <li key={s} className={cn("flex min-w-32 flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold whitespace-nowrap", done ? "bg-blush/40 text-charcoal" : "text-taupe", i === idx && "bg-blush")}>
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
        {/* ── Actions (right column on desktop, after the items on phones) ── */}
        <div className="order-2 space-y-6">
          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Update order</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <SelectField label="Order status" value={order.status} disabled={pending} onChange={(v) => changeStatus(v as OrderStatus)} options={ORDER_STATUSES.map((s) => [s, orderStatusLabel[s]])} />
              <SelectField label="Payment status" value={order.paymentStatus} disabled={pending} onChange={(v) => changePayment(v as PaymentStatus)} options={[["PENDING", "Pending"], ["CONFIRMED", "Confirmed (paid)"]]} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-taupe">Confirming payment moves an early order to “Payment confirmed” automatically.</p>
            {error && <p role="alert" className="mt-3 text-sm text-rouge">{error}</p>}
          </section>

          <section className="rounded-3xl bg-blush/45 p-5 ring-1 ring-blush-deep/30 sm:p-6">
            <p className="eyebrow">Next step</p>
            <NextStep order={order} onStatus={changeStatus} onPayment={changePayment} pending={pending} paymentTemplate={whatsappLink(templates[0].text, customerWa)} />
          </section>

          <section className="rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6">
            <p className="eyebrow text-taupe">Quick WhatsApp replies</p>
            {!settings.accountNumber && (
              <Link href="/admin/settings#payment" className="mt-2 block rounded-xl bg-linen px-3 py-2 text-xs text-espresso hover:bg-blush/40">
                Add your bank details in Settings so they fill in automatically →
              </Link>
            )}
            <ul className="mt-3 space-y-2">
              {templates.map((t) => (
                <li key={t.label}>
                  <a href={whatsappLink(t.text, customerWa)} target="_blank" rel="noopener" className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm ring-1 ring-charcoal/8 transition hover:bg-blush/20">
                    <span className="flex items-center gap-2"><WhatsAppIcon width={16} height={16} className="shrink-0 text-espresso" /> {t.label}</span>
                    <ArrowUpRight width={15} height={15} className="shrink-0 text-taupe" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="hidden rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6 xl:block">
            <Timeline order={order} />
          </section>
        </div>

        {/* ── Items: big photos so there's never any guessing ── */}
        <section className="order-1 self-start rounded-3xl bg-white p-4 ring-1 ring-charcoal/8 sm:p-7">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-xl font-semibold">Items ordered <span className="font-normal text-taupe">({itemCount})</span></h2>
            <span className="hidden text-xs tracking-[0.12em] text-taupe uppercase sm:inline">As ordered: photo, price &amp; options saved at checkout</span>
          </div>
          <ul className="mt-5 space-y-4">
            {order.items.map((item, idx) => (
              <li key={idx} className="grid gap-4 rounded-2xl bg-cream/70 p-3 ring-1 ring-charcoal/6 sm:grid-cols-[12rem_1fr] sm:p-4">
                <a href={item.image} target="_blank" rel="noopener" className="block overflow-hidden rounded-xl" title="Open full-size photo">
                  <ProductImage src={item.image} alt={item.name} className="aspect-[4/5] w-full transition-transform duration-500 hover:scale-105" eager />
                </a>
                <div className="flex min-w-0 flex-col">
                  <p className="text-xl leading-snug font-semibold">{item.name}</p>
                  <button onClick={() => copy(item.productCode)} className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-charcoal px-2.5 py-1 font-mono text-sm tracking-wider text-cream" title="Copy product code">
                    {item.productCode}
                    {copied === item.productCode ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} className="text-mist" />}
                  </button>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <Spec label="Size" value={item.size ?? "—"} />
                    <Spec label="Colour" value={item.color ?? "—"} />
                    <Spec label="Quantity" value={String(item.quantity)} />
                  </dl>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-charcoal/8 pt-4">
                    <div>
                      <p className="text-lg font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-taupe">{formatPrice(item.unitPrice)} each</p>}
                    </div>
                    <Link href={`/product/${item.slug}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.1em] text-taupe uppercase hover:text-charcoal">
                      Current listing <ArrowUpRight width={14} height={14} />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between rounded-2xl bg-charcoal px-5 py-4 text-cream">
            <span className="text-xs font-bold tracking-[0.16em] uppercase">Total</span>
            <span className="text-3xl font-semibold">{formatPrice(order.total)}</span>
          </div>
        </section>

        <section className="order-3 rounded-3xl bg-white p-5 ring-1 ring-charcoal/8 sm:p-6 xl:hidden">
          <Timeline order={order} />
        </section>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-charcoal px-6 py-4 sm:px-8">
      <dt className="text-[0.65rem] font-bold tracking-[0.16em] text-mist uppercase">{label}</dt>
      <dd className="mt-1 text-[0.95rem] leading-snug">{value}</dd>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] font-semibold tracking-[0.14em] text-taupe uppercase">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold">{value}</dd>
    </div>
  );
}

function SelectField({ label, value, options, onChange, disabled }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-[0.1em] uppercase">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-charcoal/15 bg-cream px-3 text-[0.95rem] font-medium outline-none focus:ring-4 focus:ring-blush/50"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

function Timeline({ order }: { order: Order }) {
  return (
    <>
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
    </>
  );
}

function NextStep({
  order,
  onStatus,
  onPayment,
  pending,
  paymentTemplate,
}: {
  order: Order;
  onStatus: (s: OrderStatus) => void;
  onPayment: (p: PaymentStatus) => void;
  pending: boolean;
  paymentTemplate: string;
}) {
  const btn = "btn btn-dark mt-4 w-full !min-h-12 !text-[0.7rem] disabled:opacity-60";
  const step = (() => {
    switch (order.status) {
      case "PENDING":
        return { icon: ClockIcon, title: "Check the items on SHEIN", body: "If everything is in stock, confirm the order.", action: () => onStatus("CONFIRMED"), cta: "Items available — confirm" };
      case "CONFIRMED":
        return { icon: WalletIcon, title: "Send payment details", body: "Send the customer your account details on WhatsApp, then mark the order as awaiting payment.", action: () => onStatus("AWAITING_PAYMENT"), cta: "Sent — awaiting payment", link: paymentTemplate };
      case "AWAITING_PAYMENT":
        return { icon: WalletIcon, title: "Waiting for payment", body: "Once the transfer lands in your account, confirm it here.", action: () => onPayment("CONFIRMED"), cta: "Payment received — confirm" };
      case "PAYMENT_CONFIRMED":
        return { icon: CheckCircle, title: "Paid — time to order", body: "Place the SHEIN order and mark this as processing.", action: () => onStatus("PROCESSING"), cta: "Start processing" };
      case "PROCESSING":
        return { icon: TruckIcon, title: "Being processed", body: "When the package is on its way to the customer, mark it shipped.", action: () => onStatus("SHIPPED"), cta: "Mark as shipped" };
      case "SHIPPED":
        return { icon: TruckIcon, title: "On the way", body: "Mark delivered once the customer receives it.", action: () => onStatus("DELIVERED"), cta: "Mark as delivered" };
      case "DELIVERED":
        return { icon: CheckCircle, title: "Delivered", body: "This order is complete. 🎉", action: null, cta: "" };
      case "CANCELLED":
        return { icon: ClockIcon, title: "Cancelled", body: "Reopen it by setting the status back to Pending.", action: () => onStatus("PENDING"), cta: "Reopen order" };
    }
  })();

  const Icon = step.icon;
  return (
    <div className="mt-3">
      <p className="flex items-center gap-2 text-lg font-semibold"><Icon width={20} height={20} /> {step.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-espresso/85">{step.body}</p>
      {"link" in step && step.link && (
        <a href={step.link} target="_blank" rel="noopener" className="btn btn-blush mt-4 w-full !min-h-12 !bg-white/70 !text-[0.7rem]">
          <WhatsAppIcon width={17} height={17} /> Send payment details
        </a>
      )}
      {step.action && (
        <button onClick={step.action} disabled={pending} className={btn}>
          {pending ? "Saving…" : step.cta}
        </button>
      )}
      {(order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "AWAITING_PAYMENT") && (
        <button onClick={() => onStatus("CANCELLED")} disabled={pending} className="mt-3 w-full text-xs font-semibold tracking-[0.12em] text-rouge uppercase hover:underline">
          Cancel order
        </button>
      )}
    </div>
  );
}
