# T1 — Foundation & Marketing Shell

**Owner:** Hamza · **Branch:** `hamza` · **Depends on:** Sprint 0 `main` (optional: none if you scaffold here) · **Powers demo beats:** Cold open framing, mode chrome, FR/EN posture, persona switcher

---

## Goal (1 paragraph)

Deliver the **Next.js 15 app shell** and **marketing entry** that matches root `design.MD` (read-only): tokens, typography, spacing, nav, hero, and the **three-mode tab strip** (Cockpit | War Room | Architect). Include **locale toggle** (EN/FR) at the layout level and **persona switcher** chrome so the demo can switch Sarah / Marc / MegaCorp without touching engine code.

---

## Sub-features (exhaustive checklist)

- [ ] Next.js 15 App Router project scaffold (if not on `main` yet — coordinate; prefer Sprint 0 on `main` then rebase `hamza`)
- [ ] Tailwind v4 + CSS variables aligned with `design.MD` §1–2 (brand `#FF4B00`, neutrals, semantic colors)
- [ ] `next/font` Inter + JetBrains Mono for mono
- [ ] shadcn/ui init: Button, Tabs, DropdownMenu, Sheet, Tooltip, Badge, Separator
- [ ] Sticky nav: blur, 64px height, logo + mode tabs + locale + persona + optional “Sign in”
- [ ] **Mode tabs:** route-linked `/(app)/cockpit`, `/war-room`, `/architect` or query `?mode=` — pick one pattern and document in PR
- [ ] **Landing / Sarah cold open** section: hero, badge, two CTAs (“Enter Cockpit”, “Watch arc”) — copy from DEMO_SCRIPT
- [ ] **i18n shell:** `next-intl` or React context storing `locale: 'en' | 'fr'`; pass to `html lang` and downstream fetch headers
- [ ] **Persona switcher:** dropdown bound to `localStorage` key `gambit_persona` (see PERSONAS.md)
- [ ] **404 / error** minimal branded pages
- [ ] **Accessibility:** focus rings per `design.MD` §12; skip link to main content
- [ ] **Dark mode (optional):** if time, `design.MD` §11 tokens for app interior only

---

## File / folder layout to create

```
app/
  layout.tsx                 # fonts, providers (locale, persona)
  (marketing)/page.tsx       # Sarah hero
  (app)/layout.tsx           # mode tabs + shell padding
  (app)/cockpit/page.tsx     # stub → T2
  (app)/war-room/page.tsx    # stub → T3
  (app)/architect/page.tsx   # stub → T3
src/components/
  ui/                        # shadcn
  shell/AppHeader.tsx
  shell/ModeTabs.tsx
  shell/LocaleToggle.tsx
  shell/PersonaSwitcher.tsx
src/lib/i18n/config.ts
```

---

## Public interfaces (typed)

- **Consume only:** `Persona` from DATA_MODELS; do not redefine.
- **Expose to siblings:** `useLocale()`, `usePersonaId()` React context providers documented in README snippet in PR.

---

## Implementation notes & method choices

- Use **route-based modes** for deep-linking in demo recovery (`/cockpit` if projector swaps machine).
- Locale toggle should set cookie `NEXT_LOCALE` if using `next-intl` middleware.
- Do **not** import Anthropic or Stripe in this task — keep bundle lean.
- All visual values should reference CSS variables mirroring `design.MD` to avoid drift.

---

## Acceptance criteria

- [ ] `pnpm dev` shows marketing page + can navigate to three modes (stubs OK)
- [ ] Brand gradient CTA matches `design.MD` §5.2 within one shade tolerance
- [ ] Tab order and focus visible on mode tabs + locale + persona
- [ ] No edits to `design.MD`

---

## Demo beats this task lights up

- 0:00–0:15 cold open surface
- 3:20–3:30 calendar cut can reuse header clock widget (optional T1 stretch)

---

## Fallback plan if behind

- Drop marketing animations; single-column hero
- Persona switcher as `select` not dropdown

---

## Out of scope

- Game tree, Council, API routes, OAuth, Claude, PDF, docx
