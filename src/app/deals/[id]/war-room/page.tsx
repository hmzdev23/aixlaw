import { AppShell, DealPageHeader } from "@/components/product-ui/components";
import { WarRoomLive } from "@/components/war-room/WarRoomLive";

export default async function Page({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flex?: string }>;
}) {
  const { id } = await params;
  const { flex } = await searchParams;
  return (
    <AppShell>
      <DealPageHeader dealId={id} activeTab="War Room" />
      <WarRoomLive dealId={id} initialFlex={flex === "1"} />
    </AppShell>
  );
}
