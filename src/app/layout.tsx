import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vandi | Collection records for residents",
  description:
    "See today’s waste pickup, record the handover, and keep your own receipts — in your name, not just the household’s.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#173528",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>{children}</body>
    </html>
  );
}
