import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBA Playoffs Odds — Live from Polymarket",
  description: "Real-time NBA playoff bracket with prediction market odds from Polymarket",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="light">{children}</body>
    </html>
  );
}
