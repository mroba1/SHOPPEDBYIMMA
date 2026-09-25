import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getOrderByCode, getSettings } from "@/lib/data/repo";
import { normalizeOrderCode } from "@/lib/format";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { ArrowLeft } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[code]">) {
  return { title: normalizeOrderCode(decodeURIComponent((await params).code)) };
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[code]">) {
  await requireAdmin();
  const raw = decodeURIComponent((await params).code);
  const code = normalizeOrderCode(raw);
  if (!code) redirect("/admin/orders");
  if (code !== raw) redirect(`/admin/orders/${code}`);

  const [order, settings] = await Promise.all([getOrderByCode(code), getSettings()]);
  if (!order) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
        <p className="font-mono text-2xl tracking-wider text-taupe">{code}</p>
        <h1 className="mt-3 text-3xl font-semibold">No order with that code</h1>
        <p className="mt-3 text-espresso/80">
          Double-check the code the customer sent. Order codes never use the easily confused characters O, 0, I or 1.
        </p>
        <div className="mt-8 rounded-[2rem] bg-charcoal p-6 text-cream sm:p-8">
          <OrderSearch size="hero" defaultValue={code} />
        </div>
        <Link href="/admin/orders" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
          <ArrowLeft width={16} height={16} /> All orders
        </Link>
      </div>
    );
  }
  return <OrderDetails order={order} settings={settings} />;
}
