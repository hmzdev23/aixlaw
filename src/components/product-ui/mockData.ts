import {
  Archive,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Home,
  LayoutTemplate,
  Scale,
  Settings,
  Shield,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Deals", href: "/deals", icon: BriefcaseBusiness },
  { label: "Playbooks", href: "/playbooks", icon: BookOpen },
  { label: "Counterparties", href: "/deals", icon: Users },
  { label: "Templates", href: "/playbooks", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function dealTabsFor(dealId: string) {
  return [
    { label: "Cockpit", href: `/deals/${dealId}/cockpit` },
    { label: "War Room", href: `/deals/${dealId}/war-room` },
    { label: "Architect", href: `/deals/${dealId}/architect` },
    { label: "Review", href: `/deals/${dealId}/review` },
  ] as const;
}

/** @deprecated use dealTabsFor(dealId) for dynamic deal routes */
export const dealTabs = dealTabsFor("demo");

export const activeDeals = [
  {
    name: "MegaCorp Cloud Services",
    type: "MSA",
    status: "Countered 2h ago",
    score: "-2.4",
    tone: "red" as const,
  },
  {
    name: "Globex Corporation",
    type: "SOW",
    status: "Countered 5h ago",
    score: "+1.1",
    tone: "green" as const,
  },
  {
    name: "Initech",
    type: "NDA",
    status: "Countered 1d ago",
    score: "+0.8",
    tone: "green" as const,
  },
];

export const activity = [
  {
    title: "MegaCorp Cloud Services countered your proposal",
    detail: "12 clauses changed",
    time: "2h ago",
    icon: Bell,
    tone: "red" as const,
  },
  {
    title: 'Playbook "Standard MSA" updated',
    detail: "By Alex Kim",
    time: "1d ago",
    icon: LayoutTemplate,
    tone: "neutral" as const,
  },
  {
    title: "Initech NDA fully executed",
    detail: "Signed by both parties",
    time: "2d ago",
    icon: CheckCircle2,
    tone: "green" as const,
  },
];

export const deals = [
  { name: "MegaCorp Cloud Services", counterparty: "MSA", status: "Countered", score: "-2.4", updated: "2h ago", tone: "red" as const },
  { name: "Globex Corporation", counterparty: "SOW", status: "Countered", score: "+1.1", updated: "5h ago", tone: "green" as const },
  { name: "Initech", counterparty: "NDA", status: "Executed", score: "+0.8", updated: "1d ago", tone: "green" as const },
  { name: "Umbrella Corp", counterparty: "MSA", status: "Draft", score: "—", updated: "2d ago", tone: "neutral" as const },
  { name: "Soylent Corp", counterparty: "DPA", status: "Countered", score: "-0.3", updated: "2d ago", tone: "red" as const },
];

export const clauses = [
  { number: "1.", title: "Governing Law", impact: "High impact", tone: "red" as const },
  { number: "2.", title: "Limitation of Liability", impact: "High impact", tone: "red" as const },
  { number: "3.", title: "Indemnification", impact: "Medium impact", tone: "neutral" as const },
  { number: "4.", title: "Data Protection", impact: "Medium impact", tone: "neutral" as const },
  { number: "5.", title: "Termination", impact: "Low impact", tone: "green" as const },
];

export const agents = [
  { name: "Risk Agent", stance: "Concerned", icon: Shield, tone: "red" as const, x: "24%", y: "38%" },
  { name: "Legal Agent", stance: "Strongly against", icon: Scale, tone: "red" as const, x: "20%", y: "60%" },
  { name: "Commercial Agent", stance: "Supportive", icon: BriefcaseBusiness, tone: "green" as const, x: "76%", y: "38%" },
  { name: "Compliance Agent", stance: "Supportive", icon: Archive, tone: "green" as const, x: "80%", y: "60%" },
];

export const paletteAgents = [
  { name: "Risk Agent", icon: Shield, tone: "neutral" as const },
  { name: "Commercial Agent", icon: BriefcaseBusiness, tone: "green" as const },
  { name: "Legal Agent", icon: Scale, tone: "neutral" as const },
  { name: "Precedent Agent", icon: Archive, tone: "red" as const },
  { name: "Compliance Agent", icon: CheckCircle2, tone: "green" as const },
  { name: "Custom Agent", icon: Users, tone: "red" as const },
];

export const playbooks = [
  { name: "Standard MSA Playbook", updated: "Updated 2d ago", tag: "Default" },
  { name: "SaaS MSA Playbook", updated: "Updated 1w ago" },
  { name: "Enterprise SOW Playbook", updated: "Updated 2w ago" },
  { name: "NDA Playbook", updated: "Updated 1mo ago" },
];
