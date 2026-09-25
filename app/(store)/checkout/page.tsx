import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 lg:px-10 lg:pt-16">
      <ol className="mb-8 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.14em] text-taupe uppercase">
        <li>Cart</li>
        <li aria-hidden>—</li>
        <li className="text-charcoal">Details</li>
        <li aria-hidden>—</li>
        <li>Order code</li>
        <li aria-hidden>—</li>
        <li>WhatsApp</li>
      </ol>
      <h1 className="text-5xl leading-none font-light sm:text-6xl">
        Almost <span className="font-serif text-[1.12em] italic">there</span>
      </h1>
      <p className="mt-4 mb-10 max-w-lg text-espresso/80">Just the essentials, so we know who you are and where to deliver.</p>
      <CheckoutForm />
    </div>
  );
}
