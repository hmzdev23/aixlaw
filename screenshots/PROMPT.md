# Gambit UI Screenshot-to-Code Prompt

You are converting the attached Gambit UI screenshots into production-ready frontend code.

Use these screenshots as the visual source of truth and use `design.md` as the design system source of truth. Do not redesign the product. Recreate the screens closely, but keep the implementation clean, reusable, and easy to modify.

## Product

Gambit is a clean light-mode negotiation cockpit for contracts. The UI should feel editorial, calm, premium, and easy to use. It should not feel like a noisy analytics dashboard.

## Visual rules

- Light mode only.
- Off-white app canvas.
- White cards with subtle 1px hairline borders.
- Warm near-black text.
- Muted gray secondary text.
- Pill buttons.
- Subtle shadows only.
- Large spacing and strong breathing room.
- Minimal visual elements per page.
- No dark dashboard styling.
- No neon gradients.
- No glassmorphism.
- No extra features beyond what is visible in the screenshots.
- Prioritize clarity and pixel accuracy.

## Recommended stack

- Next.js / React
- Tailwind CSS
- shadcn/ui where appropriate
- lucide-react icons
- React Flow only for the Architect workflow canvas
- Mock data arrays for all content

## Screens included

1. `01_login.png` — sign-in page with editorial hero panel.
2. `02_dashboard.png` — home dashboard with active deals and recent activity.
3. `03_deals.png` — deals table view.
4. `04_cockpit.png` — main deal cockpit with position score, MSA summary, best move, and next step.
5. `05_war_room.png` — explanation view showing how the recommendation was decided.
6. `06_architect.png` — playbook workflow builder with agent palette and canvas.
7. `07_clause_review.png` — clause diff review page.
8. `08_playbooks.png` — playbooks list page.
9. `09_settings.png` — settings/profile page.

## Implementation structure

Create a shared app shell used by all authenticated pages:

```tsx
<AppShell>
  <Sidebar />
  <main>
    {children}
  </main>
</AppShell>
```

Suggested routes:

```txt
/login
/dashboard
/deals
/deals/[id]/cockpit
/deals/[id]/war-room
/deals/[id]/architect
/deals/[id]/review
/playbooks
/settings
```

## Reusable components to create

Create reusable components instead of hardcoding each page:

```txt
AppShell
Sidebar
TopBar
PageHeader
Card
Button
StatusPill
DealCard
ActivityRow
DealsTable
MetricCard
EvalMeter
ContractSummaryCard
BestMoveCard
NextStepCard
WarRoomAgent
RecommendationNode
WorkflowNode
AgentPalette
ClauseDiff
PlaybookRow
SettingsForm
```

## Page-specific requirements

### Login

- Left panel: logo, title, email/password fields, sign-in button, social buttons.
- Right panel: editorial hero copy and chess-piece visual.
- Keep it very spacious and minimal.

### Dashboard

- Shared sidebar.
- Header: “Good morning, Sarah”.
- Active deals as clean cards.
- Recent activity as a simple list.
- One primary action: “New Deal”.

### Deals

- Shared sidebar.
- Header: “Deals”.
- Filter dropdown and search input.
- Clean table with deal, counterparty, status, score, updated.
- Pagination at bottom.

### Cockpit

- Header with deal name and tabs.
- Show only the essential decision info:
  - Position score
  - Walkaway line
  - Master Services Agreement summary
  - Your best move
  - Next step
- This should be the cleanest and most demo-friendly page.

### War Room

- Header with deal name and tabs.
- Center recommendation card.
- Four agent cards around it.
- Subtle connector lines.
- One small “View full reasoning” button.
- Avoid a complex graph or text wall.

### Architect

- Header with deal name and tabs.
- Left palette of agents.
- Center workflow canvas.
- Use React Flow if available.
- Keep nodes spacious.
- One primary action: “Save Playbook”.

### Clause Review

- Left clause navigation.
- Center diff card with red removed text and green added text.
- Right impact panel.
- Keep the comparison readable, not over-highlighted.

### Playbooks

- Sidebar shell.
- Header: “Playbooks”.
- Simple list of playbooks.
- One primary action: “New Playbook”.

### Settings

- Sidebar shell.
- Header: “Settings”.
- Tabs across the top.
- Profile form on the left and preferences form on the right.
- One primary action: “Save Changes”.

## Important instruction

Do not invent a new layout. Do not make it more complex. Do not add extra analytics panels, badges, charts, or decorative elements. The goal is to convert these exact screenshots into clean code using the design system.
