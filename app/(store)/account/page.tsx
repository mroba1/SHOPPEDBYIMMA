import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomer } from "@/lib/auth";
import { listOrdersForCustomer } from "@/lib/data/repo";
import { customerStatusLabel, formatDate, formatPrice } from "@/lib/format";
import { customerLogout } from "@/lib/actions/account";
import { ClaimOrderForm, PasswordForm, ProfileForm } from "@/components/account/AccountForms";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WhatsAppCheckoutButton } from "@/components/checkout/WhatsAppCheckoutButton";
import { ProductImage } from "@/components/ui/ProductImage";
import { ArrowRight, LogoutIcon } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const me = await requireCustomer();
  const orders = await listOrdersForCustomer(me.id);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 pb-20 sm:px-6 lg:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-script text-2xl text-blush-deep">hello, {me.name.split(" ")[0].toLowerCase()}</p>
          <h1 className="text-4xl leading-none font-light sm:text-5xl">
            My <span className="font-serif text-[1.12em] italic">account</span>
          </h1>
        </div>
        <form action={customerLogout}>
          <button className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-espresso uppercase ring-1 ring-charcoal/15 hover:bg-white/70">
            <LogoutIcon width={16} height={16} /> Sign out
          </button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">My orders</h2>
        {orders.length === 0 ? (
          <div className="mt-4 rounded-3xl bg-white/70 p-8 text-center ring-1 ring-charcoal/8">
            <p className="font-serif text-2xl italic">No orders yet</p>
            <p className="mt-1 text-sm text-taupe">Orders you place while signed in appear here.</p>
            <Link href="/shop" className="btn btn-dark mt-6">Start shopping <ArrowRight width={18} height={18} /></Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-3xl bg-white/70 p-4 ring-1 ring-charcoal/8 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/order/${o.code}`} className="font-mono text-lg font-semibold tracking-wider hover:underline">{o.code}</Link>
                    <p className="text-xs text-taupe">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items · {formatPrice(o.total)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-2 text-sm text-espresso">{customerStatusLabel[o.status]}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex -space-x-2">
                    {o.items.slice(0, 5).map((i, idx) => (
                      <ProductImage key={idx} src={i.image} alt={i.name} className="aspect-[4/5] w-10 rounded-md ring-2 ring-cream" />
                    ))}
                  </div>
                  {o.status === "PENDING" && (
                    <div className="w-full max-w-60">
                      <WhatsAppCheckoutButton code={o.code} label="Send code" className="!min-h-11 !px-4 !text-[0.65rem]" />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-3xl bg-linen/70 p-5 sm:p-6">
          <h3 className="font-semibold">Ordered as a guest before?</h3>
          <p className="mt-1 mb-4 text-sm text-taupe">Add it with its order code. It must have been placed with your WhatsApp number ({me.whatsapp}).</p>
          <ClaimOrderForm />
        </div>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white/70 p-5 ring-1 ring-charcoal/8 sm:p-7">
          <h2 className="mb-5 text-xl font-semibold">My details</h2>
          <ProfileForm me={me} />
        </section>
        <section className="self-start rounded-3xl bg-white/70 p-5 ring-1 ring-charcoal/8 sm:p-7">
          <h2 className="mb-5 text-xl font-semibold">Password</h2>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
