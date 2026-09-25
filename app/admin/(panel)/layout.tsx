import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/data/repo";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: { default: "Seller studio", template: "%s · Seller studio" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const pending = (await listOrders()).filter((o) => o.status === "PENDING").length;

  return (
    <div className="min-h-dvh bg-cream lg:flex">
      <AdminSidebar pendingCount={pending} />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
