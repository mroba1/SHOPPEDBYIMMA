import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/data/repo";
import { ORDER_STATUSES } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { AdminOrderTable, type OrderFilter } from "@/components/admin/AdminOrderTable";
import { OrderSearch } from "@/components/admin/OrderSearch";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const [orders, sp] = await Promise.all([listOrders(), searchParams]);
  const status = String(sp.status ?? "");
  const initialFilter: OrderFilter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : "ALL";

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${orders.length} order${orders.length === 1 ? "" : "s"} from the website, newest first.`}
        actions={
          <div className="w-full sm:w-[24rem]">
            <OrderSearch size="sm" />
          </div>
        }
      />
      <div className="mt-8">
        <AdminOrderTable key={initialFilter} orders={orders} initialFilter={initialFilter} />
      </div>
    </div>
  );
}
