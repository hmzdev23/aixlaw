# Gambit (mainlite)

AI contract co-pilot, end-to-end, in 11 steps.

```
upload → review → e-sig → workflow → goal → context →
war room → export → meeting → memo → done
```

## Run

```
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## What it does

1. **Upload** a PDF or DOCX (or paste text).
2. **Review** the doc Grammarly-style with auto-flagged risk clauses.
   Toggle to French; if you do, we offer to book a professional translator
   review on Google Calendar.
3. **E-signature scan** for Quebec (CQLR c. C-1.1 / UECA).
4. **Workflow** — drag-and-drop the council in the order you want them.
5. **Goal** — one sentence: what does winning look like?
6. **Context** — each named agent (Pierre, Marie, Étienne, Sophie, Antoine)
   asks 1–2 specific questions.
7. **War Room** — agents debate, the win bar moves with each turn, and you
   pick from 3 decision options that branch the path.
8. **Export** the chat (one-click redact for emails, phone numbers, dollar
   amounts, dates and any names you list).
9. **Meeting** — schedule a follow-up via Google Calendar (or get an
   add-to-calendar link).
10. **Memo** — generate a redacted PDF and post it to Slack.
11. **Done** — recap, then start fresh.

## Env

All keys optional — see `.env.example`. Without them, the app falls back to
deterministic mock outputs so the demo always works.
