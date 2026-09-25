import type { OrderStatus, PaymentStatus } from "./types";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return naira.format(value);
}

export function formatDate(iso: string, withTime = true) {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PAYMENT_CONFIRMED: "Payment confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Paid",
};

/** Accepts "sbm-7k42p", "7K42P", " SBM 7K42P " → "SBM-7K42P" */
export function normalizeOrderCode(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = clean.startsWith("SBM") ? clean.slice(3) : clean;
  return body ? `SBM-${body}` : "";
}
