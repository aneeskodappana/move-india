import Link from "next/link";
import { ResidentNav } from "@/components/resident/resident-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMonthLabel, formatRecordedAt } from "@/lib/india-date";
import type { PaymentLedgerView } from "@/services/payment.service";

export function PaymentLedger({
  ledger,
  busy,
  message,
  onPay,
}: {
  ledger: PaymentLedgerView;
  busy: boolean;
  message?: string;
  onPay(): void;
}) {
  const currentPaid = ledger.current.status === "paid";

  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <ResidentNav
          current="payments"
          location={formatMonthLabel(ledger.currentMonth)}
          name={ledger.resident.name}
          title="Payments"
        />

        <section className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden">
            <div className="bg-forest-950 p-6 text-white sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-200">Current month</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{formatMonthLabel(ledger.current.month)}</h1>
              <p className="mt-4 text-3xl font-black text-marigold-300">₹{ledger.current.amountInr}</p>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-stone-700">Status</p>
                <Badge tone={currentPaid ? "forest" : "marigold"}>{currentPaid ? "Paid" : "Pending"}</Badge>
              </div>
              {currentPaid ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-control bg-forest-900 px-5 text-sm font-black text-white"
                  href={`/payments/receipts/${ledger.current.receiptId}`}
                >
                  View receipt {ledger.current.receiptId}
                </Link>
              ) : (
                <Button className="w-full" disabled={busy} onClick={onPay}>
                  {busy ? "Recording mock payment…" : `Pay ₹${ledger.current.amountInr}`}
                </Button>
              )}
              {message ? <p aria-live="polite" className="text-sm font-bold text-forest-700">{message}</p> : null}
            </div>
          </Card>

          <div className="space-y-4">
            <aside className="rounded-control border border-marigold-300 bg-marigold-100 p-4 text-sm leading-6 text-forest-950">
              <strong>Prototype disclosure:</strong> mock UPI — no real money moves, and no payment processor is involved.
            </aside>
            <Card className="p-6">
              <h2 className="text-xl font-black text-forest-950">Receipt list</h2>
              <ul className="mt-5 space-y-4">
                {ledger.payments.map((payment) => (
                  <li className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 last:border-0 last:pb-0" key={payment.id}>
                    <div>
                      <p className="font-black text-forest-950">{formatMonthLabel(payment.month)}</p>
                      <p className="text-sm text-stone-700">
                        ₹{payment.amountInr}
                        {payment.paidAt ? ` · ${formatRecordedAt(payment.paidAt)}` : ""}
                      </p>
                    </div>
                    {payment.status === "paid" ? (
                      <Link className="text-sm font-black text-forest-800 underline" href={`/payments/receipts/${payment.receiptId}`}>
                        {payment.receiptId}
                      </Link>
                    ) : (
                      <Badge tone="marigold">Pending</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
