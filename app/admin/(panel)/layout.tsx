import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/data/repo";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Seller studio", template: "%s · Seller studio" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side check on every admin page (the proxy's check is only a first filter)
  const admin = await requireAdmin();
  const pending = (await listOrders()).filter((o) => o.status === "PENDING").length;

  return (
    <div className="min-h-dvh bg-cream lg:flex">
      <AdminSidebar admin={{ name: admin.name, email: admin.email }} pendingCount={pending} />
      <main className="min-w-0 flex-1 px-4 pt-5 pb-16 sm:px-6 lg:px-10 lg:pt-9">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
