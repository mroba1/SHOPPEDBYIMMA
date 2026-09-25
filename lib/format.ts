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
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  AWAITING_PAYMENT: "Awaiting payment",
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

/**
 * Turns whatever the owner pastes into a clean code:
 * "sbm-7k42p", "7K42P", " SBM 7K42P ", or a whole WhatsApp message like
 * "Hi, my order code is SBM-7K42P 🙏" → "SBM-7K42P"
 */
export function normalizeOrderCode(input: string) {
  const inMessage = /\bSBM[\s-]*([A-Z0-9]{5})\b/i.exec(input);
  if (inMessage) return `SBM-${inMessage[1].toUpperCase()}`;
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = clean.startsWith("SBM") ? clean.slice(3) : clean;
  return body ? `SBM-${body}` : "";
}

/** Customer-facing wording for order progress */
export const customerStatusLabel: Record<OrderStatus, string> = {
  PENDING: "Waiting for you to send the code on WhatsApp",
  CONFIRMED: "Items confirmed",
  AWAITING_PAYMENT: "Waiting for payment",
  PAYMENT_CONFIRMED: "Payment received",
  PROCESSING: "Being prepared",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
