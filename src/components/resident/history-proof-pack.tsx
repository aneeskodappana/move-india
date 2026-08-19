import Link from "next/link";
import { PrintProofButton } from "@/components/resident/print-proof-button";
import { ResidentNav } from "@/components/resident/resident-nav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMonthLabel, formatRecordedAt, formatScheduleDate } from "@/lib/india-date";
import type { ProofPackCollection, ProofPackView } from "@/services/history.service";

function collectionStatus(entry: ProofPackCollection): { label: string; tone: "forest" | "marigold" | "neutral" } {
  if (entry.handover?.status === "collected" && entry.handover.collectorMarkedAt) {
    return { label: "Collected", tone: "forest" };
  }
  if (entry.handover?.status === "kept_out") {
    return { label: "Collector confirmation missing", tone: "marigold" };
  }
  return { label: "No handover recorded", tone: "neutral" };
}

export function HistoryProofPack({ pack }: { pack: ProofPackView }) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <ResidentNav current="history" location={pack.property.ward} name={pack.resident.name} title="Proof pack" />

        <section className="flex flex-wrap items-end justify-between gap-4 py-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Your collection history</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-forest-950">Proof pack</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-700">
              {pack.resident.name} · {pack.property.addressLine}. Date, material, kept-out time, collected time, and receipts in one record.
            </p>
          </div>
          <PrintProofButton label="Print proof pack" />
        </section>

        <section aria-label="Filter by month" className="flex flex-wrap gap-2 pb-8 print:hidden">
          <Link
            aria-current={pack.month ? undefined : "page"}
            className={`inline-flex min-h-11 items-center rounded-control px-4 text-sm font-black ${
              pack.month ? "border border-forest-200 bg-paper text-forest-900" : "bg-forest-900 text-white"
            }`}
            href="/history"
          >
            All months
          </Link>
          {pack.months.map((month) => (
            <Link
              aria-current={pack.month === month ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-control px-4 text-sm font-black ${
                pack.month === month ? "bg-forest-900 text-white" : "border border-forest-200 bg-paper text-forest-900"
              }`}
              href={`/history?month=${month}`}
              key={month}
            >
              {formatMonthLabel(month)}
            </Link>
          ))}
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-forest-950">Collection and handover log</h2>
            {pack.collections.length === 0 ? (
              <Card className="p-6">
                <p className="text-sm font-bold text-stone-700">No collection records in this month.</p>
              </Card>
            ) : (
              pack.collections.map((entry) => {
                const status = collectionStatus(entry);
                return (
                  <Card className="p-6" key={entry.collectionEventId}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          {formatScheduleDate(entry.eventDate)}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-forest-950">{entry.materialType}</h3>
                        <p className="mt-1 text-sm text-stone-700">{entry.timeWindow}</p>
                      </div>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <dl className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="font-bold text-stone-700">Kept out</dt>
                        <dd className="text-right font-black text-forest-950">
                          {entry.handover ? formatRecordedAt(entry.handover.residentMarkedAt) : "Not recorded"}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="font-bold text-stone-700">Collected</dt>
                        <dd className="text-right font-black text-forest-950">
                          {entry.handover?.collectorMarkedAt
                            ? formatRecordedAt(entry.handover.collectorMarkedAt)
                            : "Awaiting confirmation"}
                        </dd>
                      </div>
                    </dl>
                  </Card>
                );
              })
            )}
          </div>

          <aside className="space-y-4">
            <h2 className="text-xl font-black text-forest-950">Payment history</h2>
            <Card className="p-6">
              {pack.payments.length === 0 ? (
                <p className="text-sm font-bold text-stone-700">No payment records in this month.</p>
              ) : (
                <ul className="space-y-4">
                  {pack.payments.map((payment) => (
                    <li className="border-b border-stone-100 pb-4 last:border-0 last:pb-0" key={payment.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-forest-950">{formatMonthLabel(payment.month)}</p>
                        <Badge tone={payment.status === "paid" ? "forest" : "marigold"}>
                          {payment.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-stone-700">₹{payment.amountInr}</p>
                      {payment.status === "paid" ? (
                        <Link
                          className="mt-2 inline-flex text-sm font-black text-forest-800 underline"
                          href={`/payments/receipts/${payment.receiptId}`}
                        >
                          Receipt {payment.receiptId}
                        </Link>
                      ) : (
                        <p className="mt-2 text-sm font-bold text-stone-500">Receipt available after payment.</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <aside className="rounded-control border border-marigold-300 bg-marigold-100 p-4 text-sm leading-6 text-forest-950">
              Payments shown here are simulated. No real money moves.
            </aside>
          </aside>
        </section>
      </div>
    </main>
  );
}
