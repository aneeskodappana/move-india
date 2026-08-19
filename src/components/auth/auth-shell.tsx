import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-forest-200 pb-5">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-control bg-forest-900 font-black text-white">V</span>
            <span className="font-black text-forest-950">Vandi</span>
          </Link>
          <Badge tone="neutral">Kochi</Badge>
        </header>
        <div className="grid gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:py-16">
          <section>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-forest-600">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-forest-950 sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-stone-700">{description}</p>
          </section>
          {children}
        </div>
        <footer className="border-t border-forest-200 py-5 text-xs leading-5 text-stone-700">Vandi is independent of government collection systems. No SMS is sent from this screen.</footer>
      </div>
    </main>
  );
}
