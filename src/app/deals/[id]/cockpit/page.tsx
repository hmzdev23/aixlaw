import { AppShell, DealPageHeader } from "@/components/product-ui/components";
import { CockpitLive } from "@/components/cockpit/CockpitLive";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <DealPageHeader dealId={id} activeTab="Cockpit" />
      <CockpitLive dealId={id} />
    </AppShell>
  );
}
