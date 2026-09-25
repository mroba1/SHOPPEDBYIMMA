import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { site } from "@/lib/config";
import { safeLocalPath } from "@/lib/redirect";
import { whatsappLink } from "@/lib/whatsapp";
import { LoginForm } from "@/components/account/AccountForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function CustomerLoginPage({ searchParams }: PageProps<"/account/login">) {
  const sp = await searchParams;
  const next = safeLocalPath(sp.next, "/account");
  if (await getCurrentCustomer()) redirect(next);

  return (
    <div className="mx-auto max-w-md px-5 pt-12 pb-20 lg:pt-20">
      <h1 className="text-4xl leading-none font-light sm:text-5xl">
        Welcome <span className="font-serif text-[1.12em] italic">back</span>
      </h1>
      <p className="mt-3 text-espresso/80">Sign in to see your orders and use your saved details. Accounts are optional: you can always check out as a guest.</p>
      <div className="mt-8">
        <LoginForm next={next} notice={sp.changed ? "Password changed. Please sign in again." : undefined} />
      </div>
      <p className="mt-8 text-center text-xs text-taupe">
        Forgot your password?{" "}
        <a href={whatsappLink(`Hello ${site.name} 👋 I need help resetting my account password.`)} target="_blank" rel="noopener" className="underline underline-offset-4">
          Message us on WhatsApp
        </a>
        {" · "}
        <Link href="/shop" className="underline underline-offset-4">Keep shopping as a guest</Link>
      </p>
    </div>
  );
}
