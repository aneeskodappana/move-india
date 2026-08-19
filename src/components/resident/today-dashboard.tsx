import { BroadcastSimulator } from "@/components/broadcast/broadcast-simulator";
import { ResidentNav } from "@/components/resident/resident-nav";
import { Card } from "@/components/ui/card";
import { formatScheduleDate } from "@/lib/india-date";
import type { TodayView } from "@/services/today.service";
import type { ReactNode } from "react";

export function TodayDashboard({ today, handoverControl }: { today: TodayView; handoverControl?: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <ResidentNav current="today" location={today.property.ward} name={today.resident.name} title="Resident Today" />

        <section className="grid gap-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
          <div className="overflow-hidden rounded-card bg-forest-950 text-white shadow-card">
            <div className="p-6 sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex rounded-full border border-forest-500 bg-forest-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Today · {formatScheduleDate(today.date)}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-200">{today.route.name}</span>
              </div>
              {today.collection ? (
                <>
                  <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-marigold-300">Put out today</p>
                  <h1 className="mt-3 text-5xl font-black leading-none tracking-tight sm:text-6xl">{today.collection.materialType}</h1>
                  <div className="mt-8 border-t border-forest-700 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-200">Collection window</p>
                    <p className="mt-2 text-3xl font-black text-marigold-300">{today.collection.timeWindow}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-forest-200">Today’s schedule</p>
                  <h1 className="mt-3 text-5xl font-black leading-none tracking-tight">No collection scheduled.</h1>
                </>
              )}
            </div>
            <div className="border-t border-forest-700 bg-forest-900 p-5 sm:px-9">
              <p className="text-sm font-bold">{today.property.addressLine}</p>
              <p className="mt-1 text-xs text-forest-200">Synthetic property · {today.property.ward}</p>
            </div>
          </div>

          <div className="space-y-6">
            {handoverControl ?? <Card className="p-6"><p className="text-sm font-bold text-stone-700">No handover action is available today.</p></Card>}
            <aside className="rounded-control border border-marigold-300 bg-marigold-100 p-4 text-sm leading-6 text-forest-950">
              <strong>Prototype disclosure:</strong> channel delivery is simulated. No SMS or WhatsApp message is actually sent.
            </aside>
          </div>
        </section>

        <section className="pb-10">
          <BroadcastSimulator message={today.message} />
        </section>
      </div>
    </main>
  );
}
