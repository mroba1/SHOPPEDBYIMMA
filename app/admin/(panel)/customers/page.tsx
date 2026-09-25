import Link from "next/link";
import { listCustomers } from "@/lib/data/repo";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/lib/config";
import { toWhatsappNumber, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/Icons";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const customers = await listCustomers();
  return (
    <div>
      <h1 className="font-serif text-4xl italic">Customers</h1>
      <p className="mt-1 text-sm text-taupe">Everyone who has placed an order, grouped by WhatsApp number. Spent = confirmed payments only.</p>

      {customers.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-10 text-center text-taupe ring-1 ring-charcoal/8">No customers yet.</p>
      ) : (
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {customers.map((c) => (
            <li key={c.whatsapp} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-charcoal/8 sm:p-5">
              <span className="font-serif grid size-12 shrink-0 place-items-center rounded-full bg-blush text-xl italic">
                {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="font-mono text-sm text-espresso">{c.whatsapp}</p>
                  </div>
                  <a
                    href={whatsappLink(`Hi ${c.name.split(" ")[0]} 👋 This is Imma from ${site.name}.`, toWhatsappNumber(c.whatsapp))}
                    target="_blank"
                    rel="noopener"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-charcoal text-cream hover:bg-ink"
                    aria-label={`Message ${c.name} on WhatsApp`}
                  >
                    <WhatsAppIcon width={18} height={18} />
                  </a>
                </div>
                <p className="mt-2 truncate text-sm text-taupe">{c.address}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-charcoal/8 pt-3 text-xs">
                  <span><strong className="font-semibold">{c.orders}</strong> order{c.orders === 1 ? "" : "s"}</span>
                  <span><strong className="font-semibold">{formatPrice(c.totalSpent)}</strong> spent</span>
                  <span className="text-taupe">
                    Last: <Link href={`/admin/orders/${c.lastOrderCode}`} className="font-mono underline underline-offset-2">{c.lastOrderCode}</Link> · {formatDate(c.lastOrderAt, false)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
