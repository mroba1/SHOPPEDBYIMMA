"use server";

import { revalidatePath } from "next/cache";
import { createOrder, updateOrder, type NewOrderLine } from "@/lib/data/repo";
import { getCurrentCustomer, requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export type CheckoutResult = { ok: true; code: string } | { ok: false; error: string; field?: string };

export async function placeOrder(input: {
  name: string;
  whatsapp: string;
  address: string;
  note?: string;
  lines: NewOrderLine[];
}): Promise<CheckoutResult> {
  const name = input.name?.trim() ?? "";
  const whatsapp = input.whatsapp?.trim() ?? "";
  const address = input.address?.trim() ?? "";
  const note = input.note?.trim().slice(0, 500) || undefined;
  const digits = whatsapp.replace(/\D/g, "");

  if (name.length < 2) return { ok: false, field: "name", error: "Please enter your full name." };
  if (digits.length < 10 || digits.length > 15) return { ok: false, field: "whatsapp", error: "Please enter a valid WhatsApp number, e.g. 0803 123 4567." };
  if (address.length < 8) return { ok: false, field: "address", error: "Please add your full delivery address (street, area, city)." };
  if (!Array.isArray(input.lines) || input.lines.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.lines.length > 50) return { ok: false, error: "That's a lot of items! Please send us a message on WhatsApp instead." };

  try {
    // Linked to an account only if the customer is signed in, and the id comes
    // from their session cookie, never from the browser's form data.
    const account = await getCurrentCustomer();
    const order = await createOrder(
      { name: name.slice(0, 80), whatsapp: whatsapp.slice(0, 20), address: address.slice(0, 300), note },
      input.lines,
      account?.id,
    );
    revalidatePath("/admin", "layout");
    return { ok: true, code: order.code };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong. Please try again." };
  }
}

export async function setOrderStatus(code: string, status: OrderStatus) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status");
  await updateOrder(code, { status });
  revalidatePath("/admin", "layout");
}

export async function setPaymentStatus(code: string, paymentStatus: PaymentStatus) {
  await requireAdmin();
  if (paymentStatus !== "PENDING" && paymentStatus !== "CONFIRMED") throw new Error("Invalid payment status");
  await updateOrder(code, { paymentStatus });
  revalidatePath("/admin", "layout");
}
