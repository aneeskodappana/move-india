import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { AppFoundation } from "@/lib/app-foundation";

type FoundationDashboardProps = {
  foundation: AppFoundation;
};

export function FoundationDashboard({ foundation }: FoundationDashboardProps) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-forest-100 to-transparent"
      />

      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-200 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-control bg-forest-900 text-lg font-black text-white">
              V
            </span>
            <div>
              <p className="text-lg font-black tracking-tight text-forest-950">Vandi</p>
              <p className="text-xs font-medium text-stone-700">Resident records, made visible</p>
            </div>
          </div>
          <Badge tone="marigold">Independent hackathon prototype</Badge>
        </header>

        <section className="grid items-end gap-10 py-14 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-8">
            <Badge tone="forest">Independent civic-utility prototype</Badge>
            <h1 className="mt-6 max-w-4xl break-words text-4xl font-black leading-none tracking-tight text-forest-950 sm:text-6xl lg:text-7xl">
              Know what is collected. Prove you handed it over.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
              Vandi is an occupant-first layer for daily collection schedules, two-sided handover
              records, and personal payment receipts—designed around the person who actually lives
              at the address.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-control bg-forest-900 px-5 text-sm font-black text-white" href="/sign-up">
                Open resident demo
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-control border border-forest-200 bg-paper px-5 text-sm font-black text-forest-900" href="/coordinator">
                Open collector demo
              </Link>
            </div>
          </div>

          <Card className="p-6 lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-forest-600">Build status</p>
            <div className="mt-5 space-y-4">
              {foundation.gates.map((gate) => (
                <div
                  className="flex items-center justify-between gap-4 border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                  key={gate.label}
                >
                  <StatusPill label={gate.label} status={gate.status} />
                  <span className="font-mono text-xs text-stone-500">{gate.command}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section aria-labelledby="journey-heading" className="pb-12 lg:pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-forest-600">Primary journey</p>
              <h2 id="journey-heading" className="mt-2 text-3xl font-black tracking-tight text-forest-950">
                One clear record from signup to receipt
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-700">
              The live demo runs on synthetic Kochi data from signup through the printable proof pack.
            </p>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {foundation.journey.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full p-6">
                  <span className="text-sm font-black text-marigold-500">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-black text-forest-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{step.description}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex flex-col gap-3 border-t border-forest-200 py-6 text-xs leading-5 text-stone-700 sm:flex-row sm:items-center sm:justify-between">
          <p>No live government systems, telecom delivery, payments, or personal data.</p>
          <p>Synthetic Kochi demo data only.</p>
        </footer>
      </div>
    </main>
  );
}
