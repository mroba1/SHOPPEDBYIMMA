import { site } from "./config";

export function whatsappLink(message: string, number: string = site.whatsappNumber) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function orderMessage(code: string) {
  return [
    `Hello ${site.name} 👋`,
    "",
    "I'd like to place an order.",
    "",
    `Order Code: ${code}`,
    "",
    "Please confirm the availability of my selected items and send me the payment details.",
  ].join("\n");
}

export function productEnquiryMessage(name: string, code: string) {
  return `Hello ${site.name} 👋\n\nI'm interested in "${name}" (${code}). Is it available?`;
}

export const generalMessage = `Hello ${site.name} 👋\n\nI'd like to shop from SHEIN through you.`;

/** Turns 0916..., +234 916..., 234916... into 234916... for wa.me links */
export function toWhatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}
