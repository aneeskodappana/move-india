import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PendingCollectorView } from "@/services/handover.service";

type CollectorQueueProps = { dateLabel: string; items: PendingCollectorView[]; busyId?: string; message?: string; onConfirm(id: string): void };

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

export function CollectorQueue(props: CollectorQueueProps) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-200 pb-5">
          <div>
            <Link className="text-xs font-black uppercase tracking-[0.2em] text-forest-600" href="/">Vandi · field operations</Link>
            <h1 className="mt-1 text-3xl font-black text-forest-950">Pickup confirmations</h1>
          </div>
          <span className="rounded-full bg-marigold-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-forest-950">DEV collector mode</span>
        </header>
        <div className="py-8">
          <p className="text-sm font-bold text-stone-700">{props.dateLabel} · resident-marked handovers awaiting your confirmation</p>
          {props.message ? <p aria-live="polite" className="mt-4 rounded-control bg-forest-50 p-4 text-sm font-bold text-forest-800">{props.message}</p> : null}
          {props.items.length === 0 ? (
            <Card className="mt-6 p-8 text-center"><h2 className="text-2xl font-black text-forest-950">Queue clear</h2><p className="mt-2 text-sm text-stone-700">No kept-out handovers are waiting today.</p></Card>
          ) : (
            <div className="mt-6 grid gap-4">
              {props.items.map((item) => (
                <Card className="p-5 sm:p-6" key={item.id}>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-xs font-black uppercase tracking-wider text-forest-600">Kept out at {formatTime(item.residentMarkedAt)}</p><h2 className="mt-2 text-xl font-black text-forest-950">{item.addressLine}</h2><p className="mt-1 text-sm text-stone-700">{item.residentName} · {item.ward}</p><p className="mt-3 text-sm font-bold text-forest-800">{item.materialType} · {item.timeWindow}</p><p className="mt-1 text-xs text-stone-500">{item.routeName}</p></div>
                    <Button disabled={Boolean(props.busyId)} onClick={() => props.onConfirm(item.id)}>{props.busyId === item.id ? "Confirming…" : "Mark collected"}</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
