import {
  AppShell,
  Button,
  Card,
  ClauseDiff,
  DealPageHeader,
  clauses,
} from "@/components/product-ui/components";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <DealPageHeader dealId={id} activeTab="Review" />
      <div className="mb-7 flex items-center justify-between border-b border-[var(--hairline)] pb-5">
        <div className="flex items-center gap-3">
          <Link href={`/deals/${id}/cockpit`} className="text-[13px] text-[var(--body)] hover:text-[var(--ink)]">
            ← Back to cockpit
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-[13px] font-medium">Compare</span>
          <span className="flex h-6 w-11 items-center rounded-full bg-[var(--ink)] p-1">
            <span className="h-4 w-4 rounded-full bg-white" />
          </span>
          <MoreHorizontal className="h-4 w-4" />
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <a
          href={`/api/workproduct/supervisor?dealId=${encodeURIComponent(id)}&mode=legal`}
          className="inline-flex h-10 items-center rounded-full border border-[var(--hairline)] bg-white px-4 text-[13px] font-medium"
        >
          Supervisor PDF (Legal)
        </a>
        <a
          href={`/api/workproduct/supervisor?dealId=${encodeURIComponent(id)}&mode=plain`}
          className="inline-flex h-10 items-center rounded-full border border-[var(--hairline)] bg-white px-4 text-[13px] font-medium"
        >
          Supervisor PDF (Plain)
        </a>
      </div>
      <div className="grid gap-7 lg:grid-cols-[250px_1fr_210px]">
        <aside>
          <h2 className="text-[14px] font-semibold">Changes</h2>
          <p className="mt-1 text-[12px] text-[var(--body)]">12 changes</p>
          <div className="mt-7 space-y-1">
            {clauses.map((clause, index) => (
              <div key={clause.title} className={`rounded-lg px-4 py-3 ${index === 1 ? "bg-[var(--surface-strong)]" : ""}`}>
                <div className="flex gap-3 text-[13px]">
                  <span className={clause.tone === "red" ? "text-red-500" : "text-[var(--body)]"}>{clause.number}</span>
                  <div>
                    <p className="font-medium">{clause.title}</p>
                    <p className={clause.tone === "red" ? "text-red-500" : clause.tone === "green" ? "text-emerald-700" : "text-[var(--body)]"}>{clause.impact}</p>
                  </div>
                </div>
              </div>
            ))}
            <p className="px-4 py-3 text-[13px] font-medium">+7 more</p>
          </div>
        </aside>
        <section>
          <h2 className="font-display mb-7 text-[32px] leading-none">2. Limitation of Liability</h2>
          <ClauseDiff />
        </section>
        <Card className="h-fit p-6">
          <h2 className="text-[14px] font-semibold">Impact</h2>
          <div className="mt-7">
            <p className="text-[12px] font-semibold text-[var(--body)]">Risk</p>
            <p className="mt-3 text-[15px] font-semibold text-red-500">High</p>
          </div>
          <div className="mt-9">
            <p className="text-[12px] font-semibold text-[var(--body)]">Position Change</p>
            <p className="mt-4 text-[25px] font-light text-emerald-700">+0.6</p>
            <p className="mt-2 text-[12px] text-[var(--body)]">If accepted</p>
          </div>
          <Button className="mt-8 w-full">Suggest Edit</Button>
        </Card>
      </div>
    </AppShell>
  );
}
