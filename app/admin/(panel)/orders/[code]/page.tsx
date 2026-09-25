import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderByCode } from "@/lib/data/repo";
import { normalizeOrderCode } from "@/lib/format";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { ArrowLeft } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/admin/orders/[code]">) {
  return { title: normalizeOrderCode((await params).code) };
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[code]">) {
  const raw = decodeURIComponent((await params).code);
  const code = normalizeOrderCode(raw);
  if (code !== raw) redirect(`/admin/orders/${code}`);

  const order = await getOrderByCode(code);
  if (!order) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="font-mono text-2xl tracking-wider text-taupe">{code}</p>
        <h1 className="font-serif mt-3 text-4xl italic">No order with that code</h1>
        <p className="mt-3 text-espresso/80">Double-check the code the customer sent — letters like O/0 and I/1 are never used in order codes.</p>
        <div className="mt-8"><OrderSearch defaultValue={code} /></div>
        <Link href="/admin/orders" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-taupe uppercase hover:text-charcoal">
          <ArrowLeft width={16} height={16} /> All orders
        </Link>
      </div>
    );
  }
  return <OrderDetails order={order} />;
}
