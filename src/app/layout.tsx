import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vandi | Collection records for residents",
  description:
    "Waste management done right: the right bag on the right morning, with a record for the person who put it out.",
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
