"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  FileText,
  Gauge,
  LayoutTemplate,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Shield,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  activeDeals,
  activity,
  agents,
  clauses,
  dealTabs,
  deals,
  navItems,
  paletteAgents,
  playbooks,
} from "./mockData";

type Tone = "red" | "green" | "neutral";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 text-[13px] font-semibold tracking-[0.08em] text-[var(--ink)]">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--ink)] text-white">
        <span className="text-[13px] leading-none">♞</span>
      </span>
      GAMBIT
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-medium transition",
        variant === "primary" && "bg-[var(--ink)] text-white shadow-[0_8px_18px_rgba(12,10,9,0.12)] hover:bg-[var(--ink-primary)]",
        variant === "secondary" && "border border-[var(--hairline)] bg-white text-[var(--ink)] hover:border-[var(--hairline-strong)]",
        variant === "ghost" && "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-strong)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-[var(--hairline)] bg-white shadow-[0_10px_30px_rgba(12,10,9,0.035)]", className)}>
      {children}
    </section>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        tone === "red" && "bg-red-50 text-red-600",
        tone === "green" && "bg-emerald-50 text-emerald-700",
        tone === "neutral" && "bg-[var(--surface-strong)] text-[var(--body)]"
      )}
    >
      {children}
    </span>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--canvas)] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1220px] overflow-hidden rounded-xl border border-[var(--hairline)] bg-white shadow-[0_18px_45px_rgba(12,10,9,0.08)]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main id="main-content" className="flex-1 bg-white px-7 py-7 md:px-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-[212px] shrink-0 border-r border-[var(--hairline)] bg-white md:block">
      <div className="border-b border-[var(--hairline)] px-7 py-6">
        <Logo />
      </div>
      <nav className="space-y-1 px-5 py-8">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-[var(--body)]",
                active && "bg-[var(--surface-strong)] font-medium text-[var(--ink)]"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.7} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function TopBar() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[var(--hairline)] bg-white px-7 md:px-10">
      <div className="md:hidden">
        <Logo />
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-5 text-[var(--ink)]">
        <Settings className="h-4 w-4" strokeWidth={1.8} />
        <Bell className="h-4 w-4" strokeWidth={1.8} />
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-strong)] text-[13px] font-medium">S</div>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.01em] text-[var(--ink)]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[14px] text-[var(--body)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function DealPageHeader({ activeTab }: { activeTab: string }) {
  return (
    <div className="mb-7 border-b border-[var(--hairline)] pb-4">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/deals" aria-label="Back to deals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-[17px] font-semibold text-[var(--ink)]">MegaCorp Cloud Services – MSA</h1>
        </div>
        {activeTab === "Architect" ? (
          <Button variant="secondary" className="h-9 px-4">Save Playbook</Button>
        ) : activeTab === "Cockpit" ? (
          <Button variant="secondary" className="h-9 px-4">Actions <ChevronDown className="h-3.5 w-3.5" /></Button>
        ) : null}
      </div>
      <nav className="flex items-center gap-8">
        {dealTabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "border-b-2 pb-2 text-[13px] font-medium",
              activeTab === tab.label ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--body)]"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function DealCard({ deal }: { deal: (typeof activeDeals)[number] }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">{deal.name}</h3>
        <p className="mt-1 text-[12px] text-[var(--body)]">{deal.type}</p>
        <p className="mt-5 text-[12px] text-[var(--body)]">{deal.status}</p>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--hairline-soft)] bg-[var(--canvas-soft)] px-5 py-3">
        <StatusPill tone={deal.tone}>⊕ {deal.score}</StatusPill>
        <span className={cn("text-[11px] font-medium", deal.tone === "red" ? "text-red-500" : "text-emerald-700")}>Your move</span>
      </div>
    </Card>
  );
}

export function ActivityRow({ item }: { item: (typeof activity)[number] }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center justify-between border-b border-[var(--hairline-soft)] px-5 py-4 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className={cn("grid h-7 w-7 place-items-center rounded-md", item.tone === "red" ? "bg-red-50 text-red-500" : item.tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-[var(--surface-strong)] text-[var(--body)]")}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[13px] font-medium text-[var(--ink)]">{item.title}</p>
          <p className="text-[12px] text-[var(--body)]">{item.detail}</p>
        </div>
      </div>
      <span className="text-[12px] text-[var(--body)]">{item.time}</span>
    </div>
  );
}

export function DealsTable() {
  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-[var(--hairline)] text-[12px] font-medium text-[var(--body)]">
            <th className="w-[38%] px-3 py-3">Deal</th>
            <th className="px-3 py-3">Counterparty</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Score</th>
            <th className="px-3 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.name} className="border-b border-[var(--hairline-soft)] last:border-b-0">
              <td className="px-3 py-4">
                <Link href="/deals/megacorp/cockpit" className="flex items-center gap-4 font-semibold text-[var(--ink)]">
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-[var(--hairline)]">
                    <FileText className="h-3 w-3" />
                  </span>
                  {deal.name}
                </Link>
              </td>
              <td className="px-3 py-4 text-[var(--ink)]">{deal.counterparty}</td>
              <td className="px-3 py-4 text-[var(--ink)]">{deal.status}</td>
              <td className={cn("px-3 py-4 font-medium", deal.tone === "red" ? "text-red-500" : deal.tone === "green" ? "text-emerald-700" : "text-[var(--body)]")}>⊕ {deal.score}</td>
              <td className="px-3 py-4 text-[var(--ink)]">{deal.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function MetricCard() {
  return (
    <Card className="p-6">
      <p className="text-[14px] font-semibold text-[var(--ink)]">Position Score</p>
      <div className="mt-7 text-[52px] font-light leading-none tracking-[-0.04em] text-[var(--ink)]">-2.4</div>
      <p className="mt-3 text-[12px] text-[var(--body)]">MegaCorp&apos;s favor</p>
      <EvalMeter />
      <div className="mt-9">
        <p className="text-[14px] font-semibold text-[var(--ink)]">Walkaway Line</p>
        <div className="mt-6 text-[44px] font-light leading-none tracking-[-0.04em]">-4.0</div>
        <p className="mt-3 text-[12px] text-[var(--body)]">Below this, walk away.</p>
        <Button className="mt-5 w-full">View Analysis</Button>
      </div>
    </Card>
  );
}

export function EvalMeter() {
  return (
    <div className="mt-7">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-red-100 via-[var(--hairline)] to-emerald-100">
        <span className="absolute left-[48%] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[var(--ink)]" />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[var(--body)]">
        <span>-10</span>
        <span>+10</span>
      </div>
    </div>
  );
}

export function ContractSummaryCard() {
  const rows = ["Governing Law", "Limitation of Liability", "Indemnification", "Data Protection", "Termination"];
  return (
    <Card className="p-7">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-[var(--ink)]">Master Services Agreement</h2>
          <p className="mt-3 text-[12px] text-[var(--body)]">12 changes</p>
        </div>
        <button className="text-[12px] text-[var(--ink)]">View full document</button>
      </div>
      <div className="mt-8 overflow-hidden rounded-lg border border-[var(--hairline)]">
        {rows.map((row, index) => (
          <div key={row} className="flex items-center gap-4 border-b border-[var(--hairline-soft)] px-5 py-3 text-[13px] last:border-b-0">
            <span className="text-[var(--body)]">{index + 1}.</span>
            <span>{row}</span>
          </div>
        ))}
        <div className="px-5 py-3 text-[12px] text-[var(--body)]">+7 more</div>
      </div>
    </Card>
  );
}

export function BestMoveCard() {
  return (
    <Card className="p-6">
      <p className="text-[13px] font-semibold text-[var(--ink)]">Your Best Move</p>
      <h3 className="mt-7 text-[17px] font-semibold">Counter with Edits</h3>
      <div className="mt-6 text-[36px] font-light text-emerald-700">+1.3</div>
      <p className="mt-1 text-[12px] text-[var(--body)]">Improve your position</p>
      <Link href="/deals/megacorp/review">
        <Button className="mt-6 w-full">See Recommended Edits</Button>
      </Link>
    </Card>
  );
}

export function NextStepCard() {
  return (
    <Card className="p-6">
      <p className="text-[13px] font-semibold text-[var(--ink)]">Next Step</p>
      <h3 className="mt-7 text-[15px] font-semibold">Send counterproposal</h3>
      <p className="mt-1 text-[12px] text-[var(--body)]">Based on your edits and playbook</p>
      <p className="mt-4 text-[12px] text-[var(--body)]">2 min</p>
    </Card>
  );
}

export function WarRoomAgent({ agent }: { agent: (typeof agents)[number] }) {
  const Icon = agent.icon;
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3" style={{ left: agent.x, top: agent.y }}>
      {agent.x < "50%" ? (
        <>
          <div className="w-28 text-right">
            <p className="text-[13px] font-semibold">{agent.name}</p>
            <p className="text-[12px] text-[var(--body)]">{agent.stance}</p>
          </div>
          <span className={cn("grid h-14 w-14 place-items-center rounded-full border", agent.tone === "red" ? "border-red-100 bg-red-50 text-red-500" : "border-emerald-100 bg-emerald-50 text-emerald-700")}>
            <Icon className="h-5 w-5" />
          </span>
        </>
      ) : (
        <>
          <span className="grid h-14 w-14 place-items-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700">
            <Icon className="h-5 w-5" />
          </span>
          <div className="w-32">
            <p className="text-[13px] font-semibold">{agent.name}</p>
            <p className="text-[12px] text-[var(--body)]">{agent.stance}</p>
          </div>
        </>
      )}
    </div>
  );
}

export function RecommendationNode() {
  return (
    <Card className="absolute left-1/2 top-1/2 z-10 w-[230px] -translate-x-1/2 -translate-y-1/2 p-6">
      <p className="text-[12px] text-[var(--body)]">Recommendation</p>
      <h3 className="mt-3 text-[17px] font-semibold">Counter with Edits</h3>
      <p className="mt-4 text-[24px] font-light text-emerald-700">+1.3</p>
    </Card>
  );
}

function WorkflowNode({ label, icon: Icon = Gauge, tone = "neutral", className }: { label: string; icon?: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <div className={cn("absolute rounded-lg border border-[var(--hairline)] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(12,10,9,0.05)]", className)}>
      <div className="flex items-center gap-2 text-[12px] font-medium">
        <span className={cn("grid h-7 w-7 place-items-center rounded-md", tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "red" ? "bg-red-50 text-red-500" : "bg-[var(--surface-strong)] text-[var(--body)]")}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
    </div>
  );
}

export function AgentPalette() {
  return (
    <Card className="w-[200px] shrink-0 overflow-hidden">
      <div className="border-b border-[var(--hairline)] px-5 py-4 text-[14px] font-semibold">Agents</div>
      <div className="divide-y divide-[var(--hairline-soft)]">
        {paletteAgents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.name} className="flex items-center gap-3 px-5 py-3 text-[12px] font-medium">
              <span className={cn("grid h-7 w-7 place-items-center rounded-md", agent.tone === "green" ? "bg-emerald-50 text-emerald-700" : agent.tone === "red" ? "bg-red-50 text-red-500" : "bg-[var(--surface-strong)] text-[var(--body)]")}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {agent.name}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function WorkflowCanvas() {
  return (
    <div className="relative h-[470px] min-w-0 flex-1 overflow-hidden rounded-xl bg-[radial-gradient(var(--hairline)_1px,transparent_1px)] [background-size:18px_18px]">
      <svg className="absolute inset-0 h-full w-full text-[var(--hairline-strong)]" fill="none">
        <path d="M105 190 C145 190 145 150 195 150" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M105 190 C150 190 150 250 195 250" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M300 150 C365 150 365 150 435 150" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M300 250 C365 250 365 150 435 150" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M300 250 C365 250 365 322 435 322" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M300 360 C365 360 365 322 435 322" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M575 150 C660 150 660 232 735 232" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M575 322 C660 322 660 232 735 232" stroke="currentColor" strokeDasharray="4 4" />
      </svg>
      <WorkflowNode label="Intake" className="left-[20px] top-[166px]" />
      <WorkflowNode label="Risk Agent" icon={Shield} className="left-[195px] top-[126px]" />
      <WorkflowNode label="Legal Agent" icon={Scale} tone="red" className="left-[195px] top-[226px]" />
      <WorkflowNode label="Precedent Agent" icon={Archive} tone="red" className="left-[195px] top-[336px]" />
      <WorkflowNode label="Commercial Agent" icon={BriefcaseBusiness} tone="green" className="left-[435px] top-[126px]" />
      <WorkflowNode label="Compliance Agent" icon={CheckCircle2} tone="green" className="left-[435px] top-[298px]" />
      <WorkflowNode label="Recommendation" className="left-[735px] top-[208px]" />
    </div>
  );
}

export function ClauseDiff() {
  return (
    <Card className="p-8">
      <p className="mb-7 text-[13px] font-semibold text-[var(--body)]">MegaCorp&apos;s Version</p>
      <p className="text-[14px] leading-7 text-red-600 line-through decoration-red-600/70">
        In no event shall either party be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or related to this Agreement.
      </p>
      <p className="mb-7 mt-12 text-[13px] font-semibold text-[var(--body)]">Your Proposed Version</p>
      <p className="text-[14px] leading-7 text-[var(--ink)]">
        In no event shall either party be liable for any indirect or consequential damages, excluding <span className="rounded-sm bg-emerald-50 text-emerald-800 underline decoration-emerald-700/50">liability for confidentiality breach or data security incidents.</span>
      </p>
    </Card>
  );
}

export function PlaybookRow({ item }: { item: (typeof playbooks)[number] }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--hairline-soft)] px-5 py-5 last:border-b-0">
      <div className="flex items-center gap-4">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--body)]">
          <LayoutTemplate className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-[var(--ink)]">{item.name}</p>
          <p className="text-[12px] text-[var(--body)]">{item.updated}</p>
        </div>
      </div>
      <div className="flex items-center gap-7">
        {item.tag ? <StatusPill>{item.tag}</StatusPill> : null}
        <MoreHorizontal className="h-4 w-4 text-[var(--body)]" />
      </div>
    </div>
  );
}

export function SettingsForm() {
  return (
    <div>
      <div className="mb-6 flex gap-8 border-b border-[var(--hairline)] text-[13px]">
        {["Profile", "Integrations", "Notifications", "Team", "Billing"].map((tab, index) => (
          <button key={tab} className={cn("border-b-2 pb-3 font-medium", index === 0 ? "border-[var(--ink)] text-[var(--ink)]" : "border-transparent text-[var(--body)]")}>{tab}</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-[15px] font-semibold">Profile Information</h2>
          <Input label="Name" value="Sarah Chen" />
          <Input label="Email" value="sarah@acme.com" />
          <Input label="Role" value="Account Executive" />
          <h3 className="mt-8 text-[14px] font-semibold">Change Password</h3>
          <Input label="Current Password" placeholder="Enter current password" />
        </Card>
        <Card className="p-6">
          <h2 className="text-[15px] font-semibold">Preferences</h2>
          <Select label="Language" value="English" />
          <Select label="Time Zone" value="(UTC-5) Eastern Time (US & Canada)" />
          <Select label="Currency" value="USD – US Dollar" />
          <Button className="mt-7 w-full">Save Changes</Button>
        </Card>
      </div>
    </div>
  );
}

export function Input({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <label className="mt-5 block">
      <span className="text-[12px] font-semibold text-[var(--ink)]">{label}</span>
      <input defaultValue={value} placeholder={placeholder} className="mt-2 h-10 w-full rounded-md border border-[var(--hairline)] bg-white px-4 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--hairline-strong)]" />
    </label>
  );
}

export function Select({ label, value }: { label: string; value: string }) {
  return (
    <label className="mt-5 block">
      <span className="text-[12px] font-semibold text-[var(--ink)]">{label}</span>
      <div className="mt-2 flex h-10 items-center justify-between rounded-md border border-[var(--hairline)] bg-white px-4 text-[13px] text-[var(--ink)]">
        {value}
        <ChevronDown className="h-4 w-4 text-[var(--body)]" />
      </div>
    </label>
  );
}

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Good morning, Sarah" subtitle="Here's what's happening with your deals." action={<Button><Plus className="h-4 w-4" /> New Deal</Button>} />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Active Deals</h2>
        <button className="text-[12px] text-[var(--body)]">View all</button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {activeDeals.map((deal) => <DealCard key={deal.name} deal={deal} />)}
      </div>
      <h2 className="mb-4 mt-8 text-[14px] font-semibold">Recent Activity</h2>
      <Card className="overflow-hidden">
        {activity.map((item) => <ActivityRow key={item.title} item={item} />)}
      </Card>
    </>
  );
}

export function DealsPage() {
  return (
    <>
      <PageHeader title="Deals" subtitle="Track and manage your negotiations." action={<Button><Plus className="h-4 w-4" /> New Deal</Button>} />
      <div className="mb-5 flex gap-4">
        <Button variant="secondary" className="w-[140px] justify-between">All Deals <ChevronDown className="h-4 w-4" /></Button>
        <div className="flex h-10 flex-1 items-center gap-3 rounded-lg border border-[var(--hairline)] px-4 text-[13px] text-[var(--body)]">
          <Search className="h-4 w-4" />
          Search deals...
        </div>
      </div>
      <DealsTable />
      <div className="mt-7 flex items-center justify-center gap-5 text-[12px] text-[var(--ink)]">
        <span>1</span><span>2</span><span>3</span><ChevronRight className="h-3.5 w-3.5" />
      </div>
    </>
  );
}

export function PlaybooksPage() {
  return (
    <>
      <PageHeader title="Playbooks" subtitle="Your negotiation playbooks and templates." action={<Button><Plus className="h-4 w-4" /> New Playbook</Button>} />
      <Card className="overflow-hidden">
        {playbooks.map((item) => <PlaybookRow key={item.name} item={item} />)}
      </Card>
    </>
  );
}

export function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--canvas)] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-[1220px] overflow-hidden rounded-xl border border-[var(--hairline)] bg-white shadow-[0_18px_45px_rgba(12,10,9,0.08)] lg:grid-cols-[490px_1fr]">
        <section className="flex flex-col border-r border-[var(--hairline)]">
          <div className="border-b border-[var(--hairline)] px-14 py-7">
            <Logo />
          </div>
          <div className="flex flex-1 flex-col justify-center px-14 py-12">
            <h1 className="text-[24px] font-semibold tracking-[-0.01em]">Sign in to your account</h1>
            <p className="mt-2 text-[14px] text-[var(--body)]">Welcome back. Please enter your details.</p>
            <Input label="Email" value="sarah@acme.com" />
            <label className="mt-5 block">
              <span className="text-[12px] font-semibold text-[var(--ink)]">Password</span>
              <div className="mt-2 flex h-10 items-center rounded-md border border-[var(--hairline)] bg-white px-4">
                <input type="password" defaultValue="password" className="min-w-0 flex-1 text-[13px] outline-none" />
                <Eye className="h-4 w-4 text-[var(--body)]" />
              </div>
            </label>
            <div className="mt-2 text-right text-[12px] text-[var(--body)]">Forgot password?</div>
            <Link href="/dashboard"><Button className="mt-4 w-full">Sign in</Button></Link>
            <div className="my-7 text-center text-[12px] text-[var(--body)]">or continue with</div>
            <Button variant="secondary" className="mb-3 w-full">G <span>Sign in with Google</span></Button>
            <Button variant="secondary" className="w-full">▦ <span>Sign in with Microsoft</span></Button>
            <p className="mt-auto pt-10 text-center text-[12px] text-[var(--body)]">Don&apos;t have an account? <span className="font-medium text-[var(--ink)]">Contact sales</span></p>
          </div>
        </section>
        <section className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#fafafa_0%,#f7f2ec_40%,#eaf6fb_100%)] lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,#f5e9df)]" />
          <div className="relative z-10 max-w-[560px] px-12 text-center">
            <h2 className="font-display text-[46px] leading-[1.12] tracking-[-0.01em] text-[var(--ink)]">
              The negotiation cockpit<br />that thinks like your opponent.
            </h2>
            <p className="mx-auto mt-7 max-w-[350px] text-[15px] leading-6 text-[var(--body)]">
              Model your counterparty. See every move. Close with confidence.
            </p>
            <div className="mt-24 text-[120px] leading-none text-[var(--ink-primary)] drop-shadow-[0_18px_20px_rgba(12,10,9,0.15)]">♟</div>
          </div>
        </section>
      </div>
    </main>
  );
}

export { activeDeals, activity, agents, clauses, deals, playbooks, ChevronLeft, MoreHorizontal };
