import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

// Every status colour comes from the flyer palette — no traffic-light greens/blues.
const orderStyles: Record<OrderStatus, string> = {
  PENDING: "bg-linen text-espresso ring-espresso/15",
  CONFIRMED: "bg-blush/55 text-charcoal ring-blush-deep/40",
  PAYMENT_CONFIRMED: "bg-gold/20 text-[#6f532d] ring-gold/40",
  PROCESSING: "bg-nude/60 text-espresso ring-taupe/30",
  SHIPPED: "bg-espresso text-blush ring-espresso",
  DELIVERED: "bg-charcoal text-cream ring-charcoal",
  CANCELLED: "bg-rouge/10 text-rouge ring-rouge/25",
};

const paymentStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-cream text-espresso ring-espresso/20 border-dashed",
  CONFIRMED: "bg-gold/20 text-[#6f532d] ring-gold/40",
};

const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase ring-1 ring-inset";

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span className={cn(base, orderStyles[status], className)}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {orderStatusLabel[status]}
    </span>
  );
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <span className={cn(base, paymentStyles[status], className)}>
      {status === "CONFIRMED" ? "✓ " : ""}
      {paymentStatusLabel[status]}
    </span>
  );
}
