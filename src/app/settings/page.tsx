import { AppShell, PageHeader, SettingsForm } from "@/components/product-ui/components";

export default function Page() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />
      <SettingsForm />
    </AppShell>
  );
}
