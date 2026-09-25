import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data/repo";
import { ADMIN_SESSION_MS, adminPath } from "@/lib/session";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm, PaymentForm, ProfileForm, SecurityCard } from "@/components/admin/SettingsForms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile, password, payment details and security." />
      <ProfileForm name={admin.name} email={admin.email} />
      <PaymentForm settings={settings} />
      <PasswordForm />
      <SecurityCard loginPath={adminPath()} sessionHours={ADMIN_SESSION_MS / 3_600_000} />
    </div>
  );
}
