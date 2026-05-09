import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gambit , AI contract co-pilot",
  description:
    "Upload a contract, debate it with an AI council, export memos and book meetings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
