/**
 * Placeholder marketing page. Hamza (T1) replaces this with the real cold-open
 * + HeroVideo.MD chrome. Will (T7) only ships the API-side scaffold.
 */
export default function HomePage() {
  return (
    <main style={{ padding: "48px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        Gambit — scaffold ready
      </h1>
      <p style={{ color: "#666", maxWidth: 640, lineHeight: 1.6 }}>
        T7 (inbound + auth + personas) is wired. UI lives on the{" "}
        <code>hamza</code> branch.
      </p>
      <ul style={{ marginTop: 24, color: "#444", lineHeight: 1.8 }}>
        <li>
          <code>POST /api/demo/trigger</code> — manual demo InboundEvent
        </li>
        <li>
          <code>GET /api/personas</code> — persona switcher data
        </li>
        <li>
          <code>GET /api/inbound/latest?dealId=…</code> — last InboundEvent
        </li>
        <li>
          <code>GET /api/auth/signin</code> — Google OAuth (or demo bypass)
        </li>
      </ul>
    </main>
  );
}
