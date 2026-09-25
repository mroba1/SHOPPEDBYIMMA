import { listCategories } from "@/lib/data/repo";
import { CartProvider } from "@/components/cart/CartProvider";
import { AddedToast, CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = (await listCategories()).map(({ slug, name }) => ({ slug, name }));
  return (
    <CartProvider>
      <Header categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} />
      <MobileNav />
      <CartDrawer />
      <AddedToast />
    </CartProvider>
  );
}
