import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { normalizeOrderCode } from "@/lib/format";
import { safeLocalPath } from "@/lib/redirect";
import { RegisterForm } from "@/components/account/AccountForms";
import { CheckIcon } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: PageProps<"/account/register">) {
  const sp = await searchParams;
  const next = safeLocalPath(sp.next, "/account");
  if (await getCurrentCustomer()) redirect(next);
  const claim = typeof sp.claim === "string" ? normalizeOrderCode(sp.claim) : undefined;

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 pt-12 pb-20 lg:grid-cols-[1fr_26rem] lg:pt-20">
      <div>
        <p className="eyebrow text-taupe">Optional</p>
        <h1 className="mt-3 text-4xl leading-none font-light sm:text-5xl">
          Create an <span className="font-serif text-[1.12em] italic">account</span>
        </h1>
        <p className="mt-4 max-w-md text-espresso/80">You never need an account to shop. It just makes things easier next time:</p>
        <ul className="mt-6 space-y-3 text-sm">
          {["See all your orders and order codes in one place", "Track each order's status", "Checkout pre-filled with your saved delivery address"].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-blush"><CheckIcon width={13} height={13} /></span>
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-white/70 p-6 ring-1 ring-charcoal/8 sm:p-8">
        <RegisterForm next={next} claim={claim} />
      </div>
    </div>
  );
}
