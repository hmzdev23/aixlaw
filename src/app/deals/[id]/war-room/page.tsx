import {
  AppShell,
  Button,
  DealPageHeader,
  RecommendationNode,
  WarRoomAgent,
  agents,
} from "@/components/product-ui/components";
import { ChevronDown } from "lucide-react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <DealPageHeader dealId={id} activeTab="War Room" />
      <section className="relative min-h-[550px] rounded-xl bg-white">
        <div className="text-center">
          <h2 className="text-[18px] font-semibold text-[var(--ink)]">How this move was decided</h2>
          <p className="mt-2 text-[13px] text-[var(--body)]">The council of agents debated and reached a recommendation.</p>
        </div>
        <div className="absolute left-1/2 top-[48%] h-[340px] w-px -translate-x-1/2 -translate-y-1/2 border-l border-dashed border-[var(--hairline-strong)]" />
        <div className="absolute left-[20%] right-[20%] top-[48%] border-t border-dashed border-[var(--hairline-strong)]" />
        <RecommendationNode />
        {agents.map((agent) => <WarRoomAgent key={agent.name} agent={agent} />)}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Button variant="secondary" className="h-9 px-4">View full reasoning <ChevronDown className="h-3.5 w-3.5" /></Button>
        </div>
      </section>
    </AppShell>
  );
}
