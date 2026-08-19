import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vandi | Resident waste-collection records",
  description:
    "An independent hackathon prototype for clear collection schedules and two-sided handover records.",
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
