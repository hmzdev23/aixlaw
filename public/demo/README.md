# Demo assets

Static binary assets served at `/demo/*` by Next.js.

| Path | Purpose | Owner |
|------|---------|-------|
| `sarah-send-it.m4a` *(missing — please drop in)* | Voice sign-off audio. Transcript: "Looks good. Send it." Duration < 5s. Cockpit `<audio>` plays this; `ended` event triggers `POST /api/signoff/complete`. | Will (T8) |

The voice file is **not committed** because there is no canonical recording yet
— the team should record one (any phone), trim to under 5s, and drop it here as
`sarah-send-it.m4a` (or `.mp3`; update the Cockpit `<audio src>` if so).

If the file is missing at demo time, the sign-off state machine still works —
`/api/signoff/{start,complete}` are independent of the audio asset. The
Cockpit will just play silence. Don't ship without the audio.
