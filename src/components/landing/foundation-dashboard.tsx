import Link from "next/link";
import { CollectionMark } from "@/components/landing/collection-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
              <p className="text-xs font-medium text-stone-700">Collection records for Kochi</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-3">
            <Link className="text-sm font-black text-forest-900" href="/coordinator">
              Collector sign-in
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-control bg-forest-900 px-4 text-sm font-black text-white" href="/sign-up">
              Resident sign-in
            </Link>
          </nav>
        </header>

        <section className="grid items-start gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-8">
            <Badge tone="forest">Kochi collection service</Badge>
            <h1 className="mt-6 max-w-4xl break-words text-4xl font-black leading-none tracking-tight text-forest-950 sm:text-6xl lg:text-7xl">
              Waste management done right.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl">
              The right bag, on the right morning, handed to the collector — and a record for
              the person who put it out, even if they are a tenant, not the owner.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center rounded-control bg-forest-900 px-5 text-sm font-black text-white" href="/sign-up">
                Sign in as a resident
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-control border border-forest-200 bg-paper px-5 text-sm font-black text-forest-900" href="/coordinator">
                Collector sign-in
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-card border border-forest-200 bg-paper shadow-card">
              <div className="bg-forest-50 px-5 pb-3 pt-5">
                <CollectionMark className="mx-auto h-auto w-full max-w-[220px]" />
                <p className="mt-1 text-center text-xs font-bold uppercase tracking-widest text-forest-600">
                  Bin out · vehicle on the route
                </p>
              </div>
              <div className="bg-forest-950 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-forest-200">This morning on your route</p>
                <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-marigold-300">Put out today</p>
                <p className="mt-3 text-4xl font-black leading-none tracking-tight">{foundation.samplePickup.material}</p>
                <div className="mt-6 border-t border-forest-700 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-200">Collection window</p>
                  <p className="mt-2 text-2xl font-black text-marigold-300">{foundation.samplePickup.timeWindow}</p>
                </div>
              </div>
              <div className="border-t border-forest-800 bg-forest-900 p-5 text-white">
                <p className="text-sm font-bold">{foundation.samplePickup.ward}</p>
                <p className="mt-1 text-xs text-forest-200">{foundation.samplePickup.route}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-700">
              You mark waste kept out. The collector confirms pickup separately, so both times stay on your record.
            </p>
          </div>
        </section>

        <section aria-label="Areas served" className="border-y border-forest-200 py-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-forest-600">Serving</p>
            {foundation.serviceArea.map((ward) => (
              <p className="text-sm font-bold text-forest-950" key={ward}>{ward}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="waste-heading" className="py-12 lg:pt-16 lg:pb-4">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-forest-600">Waste management</p>
            <h2 id="waste-heading" className="mt-2 text-3xl font-black tracking-tight text-forest-950">
              Cleaner streets start with a clearer doorstep.
            </h2>
            <p className="mt-4 text-base leading-7 text-stone-700">
              The vehicle only helps if the right waste is out, and someone can show it was handed over. Vandi keeps that trail for the person who lives there.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {foundation.highlights.map((highlight) => (
              <Card className="h-full p-6" key={highlight.title}>
                <h3 className="text-xl font-black text-forest-950">{highlight.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-700">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="journey-heading" className="py-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-forest-600">How it works</p>
              <h2 id="journey-heading" className="mt-2 text-3xl font-black tracking-tight text-forest-950">
                One record from sign-in to receipt
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-stone-700">
              Built for shared buildings in Kochi, where the person who puts waste out is often not the owner on the household record.
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
          <p>Independent collection records for Kochi residents. Not a government service.</p>
          <p>SMS, WhatsApp, and UPI shown in the app are previews only.</p>
        </footer>
      </div>
    </main>
  );
}
