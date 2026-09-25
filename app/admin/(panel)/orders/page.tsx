import { listOrders } from "@/lib/data/repo";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { OrderSearch } from "@/components/admin/OrderSearch";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl italic">Orders</h1>
          <p className="mt-1 text-sm text-taupe">Every order placed on the website, newest first.</p>
        </div>
        <div className="lg:w-[26rem]">
          <OrderSearch size="sm" />
        </div>
      </div>
      <div className="mt-8">
        <AdminOrderTable orders={orders} />
      </div>
    </div>
  );
}
