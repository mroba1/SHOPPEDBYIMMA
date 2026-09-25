import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { editorial } from "@/lib/data/seed";
import { site } from "@/lib/config";
import { DotGrid } from "@/components/ui/Brand";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Seller login", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh bg-charcoal text-cream lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={editorial.hero} alt="" className="absolute inset-0 size-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal" />
        <DotGrid rows={5} className="absolute top-10 left-10" />
      </div>
      <div className="flex flex-col justify-center px-6 py-16 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-xl font-light tracking-[0.24em]">{site.wordmark}</p>
          <p className="font-script mt-1 pl-3 text-2xl text-blush">seller studio</p>
          <h1 className="mt-12 text-3xl font-light">
            Welcome <span className="font-serif text-[1.15em] italic">back.</span>
          </h1>
          <p className="mt-2 text-sm text-cream/70">Log in to look up orders, confirm payments and manage your products.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
