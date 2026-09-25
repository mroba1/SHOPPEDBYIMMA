import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { adminSetupStatus } from "@/lib/data/repo";
import { editorial } from "@/lib/data/seed";
import { adminPath, sessionSecret } from "@/lib/session";
import { site } from "@/lib/config";
import { DotGrid } from "@/components/ui/Brand";
import { LockIcon } from "@/components/ui/Icons";
import { LoginForm } from "./LoginForm";

// Reached only through the private URL (/<ADMIN_PATH>), which proxy.ts rewrites here.

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentAdmin()) redirect("/admin/dashboard");
  const [{ hasAdmin, recoveryEnabled }, sp] = await Promise.all([adminSetupStatus(), searchParams]);
  const misconfigured = !sessionSecret() ? "SESSION_SECRET" : !hasAdmin ? "ADMIN_EMAIL and ADMIN_PASSWORD" : null;

  return (
    <main className="grid min-h-dvh bg-charcoal text-cream lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={editorial.hero} alt="" className="absolute inset-0 size-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal" />
        <DotGrid rows={5} className="absolute top-10 left-10" />
      </div>
      <div className="flex flex-col justify-center px-6 py-14 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-xl font-light tracking-[0.24em]">{site.wordmark}</p>
          <p className="font-script mt-1 pl-3 text-2xl text-blush">seller studio</p>
          <h1 className="mt-12 text-3xl font-light">
            Welcome <span className="font-serif text-[1.15em] italic">back.</span>
          </h1>
          <p className="mt-2 text-sm text-cream/70">Sign in to find orders, confirm payments and manage your shop.</p>

          {misconfigured ? (
            <div className="mt-8 rounded-2xl bg-white/[0.06] p-5 text-sm ring-1 ring-blush/30">
              <p className="flex items-center gap-2 font-semibold text-blush"><LockIcon width={18} height={18} /> Sign-in isn&apos;t set up yet</p>
              <p className="mt-2 text-cream/75">Set {misconfigured} in the server&apos;s environment variables, then redeploy.</p>
            </div>
          ) : (
            <LoginForm next={typeof sp.next === "string" ? sp.next : ""} forgotHref={recoveryEnabled ? `/${adminPath()}/forgot-password` : null} />
          )}
          <p className="mt-10 flex items-center gap-2 text-xs text-mist">
            <LockIcon width={14} height={14} /> Private area. Access is logged out automatically after 12 hours.
          </p>
        </div>
      </div>
    </main>
  );
}
