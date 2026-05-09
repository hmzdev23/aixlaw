import {
  AgentPalette,
  AppShell,
  DealPageHeader,
  WorkflowCanvas,
} from "@/components/product-ui/components";

export default function Page() {
  return (
    <AppShell>
      <DealPageHeader activeTab="Architect" />
      <div className="mb-7">
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--ink)]">Build your negotiation playbook</h2>
        <p className="mt-2 text-[13px] text-[var(--body)]">Drag, connect, and configure agents.</p>
      </div>
      <div className="flex gap-7">
        <AgentPalette />
        <WorkflowCanvas />
      </div>
    </AppShell>
  );
}
