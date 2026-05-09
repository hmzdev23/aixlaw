import type { ReactNode } from "react";

export const metadata = {
  title: "Gambit — negotiation cockpit",
  description:
    "Stockfish for deals. Counterparty Ghost, chess-style game tree, multi-agent War Room.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
