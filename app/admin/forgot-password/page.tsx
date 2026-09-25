import type { Metadata } from "next";
import { adminSetupStatus } from "@/lib/data/repo";
import { adminPath } from "@/lib/session";
import { site } from "@/lib/config";
import { ResetForm } from "./ResetForm";

// Reached only through /<ADMIN_PATH>/forgot-password (see proxy.ts).
// There's no email service yet, so ownership is proven with ADMIN_RECOVERY_KEY,
// a secret kept in the server's environment variables.

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const { recoveryEnabled } = await adminSetupStatus();
  return (
    <main className="grid min-h-dvh place-items-center bg-charcoal px-6 py-14 text-cream">
      <div className="w-full max-w-sm">
        <p className="font-display text-lg font-light tracking-[0.24em]">{site.wordmark}</p>
        <h1 className="mt-10 text-3xl font-light">
          Reset your <span className="font-serif text-[1.15em] italic">password</span>
        </h1>
        {recoveryEnabled ? (
          <>
            <p className="mt-2 text-sm text-cream/70">Enter your login email, the recovery key your developer gave you, and a new password.</p>
            <ResetForm loginHref={`/${adminPath()}`} />
          </>
        ) : (
          <p className="mt-4 rounded-2xl bg-white/[0.06] p-5 text-sm text-cream/80 ring-1 ring-blush/30">
            Password reset isn&apos;t set up on this server. Ask your developer to set <span className="font-mono">ADMIN_RECOVERY_KEY</span>.
          </p>
        )}
      </div>
    </main>
  );
}
