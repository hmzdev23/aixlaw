import {
  AppShell,
  BestMoveCard,
  ContractSummaryCard,
  DealPageHeader,
  MetricCard,
  NextStepCard,
} from "@/components/product-ui/components";

export default function Page() {
  return (
    <AppShell>
      <DealPageHeader activeTab="Cockpit" />
      <div className="grid gap-7 lg:grid-cols-[300px_1fr_310px]">
        <MetricCard />
        <ContractSummaryCard />
        <div className="space-y-7">
          <BestMoveCard />
          <NextStepCard />
        </div>
      </div>
    </AppShell>
  );
}
