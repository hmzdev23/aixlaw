import { AppShell, DealPageHeader } from "@/components/product-ui/components";
import { ArchitectLive } from "@/components/architect/ArchitectLive";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <DealPageHeader dealId={id} activeTab="Architect" />
      <div className="mb-7">
        <h2 className="font-display text-[42px] leading-none tracking-[-0.03em] text-[var(--ink)]">
          Architect the deal machine
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[var(--body)]">
          Load the default Spellbook → OSFI → PIPEDA → Law 25 → Ghost → Tree → Crown
          graph, tune agent weights, save it, and execute it into a real Decision.
        </p>
      </div>
      <ArchitectLive dealId={id} />
    </AppShell>
  );
}
