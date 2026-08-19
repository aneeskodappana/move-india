import Link from "next/link";
import { PrintProofButton } from "@/components/resident/print-proof-button";
import { Card } from "@/components/ui/card";
import { formatMonthLabel, formatRecordedAt } from "@/lib/india-date";
import type { PaymentReceiptView } from "@/services/payment.service";

export function ReceiptAccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 text-center">
      <div className="max-w-md">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Authorization</p>
        <h1 className="mt-3 text-4xl font-black text-forest-950">You can only view your own receipts.</h1>
        <p className="mt-4 leading-7 text-stone-700">Receipts stay with the occupant who paid them.</p>
      </div>
    </main>
  );
}

export function PaymentReceipt({ receipt }: { receipt: PaymentReceiptView }) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link className="text-sm font-black text-forest-800 underline" href="/payments">
            Back to payments
          </Link>
          <PrintProofButton label="Print receipt" />
        </div>
        <Card className="overflow-hidden">
          <div className="bg-forest-950 p-6 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-200">Digital receipt</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">{receipt.payment.receiptId}</h1>
            <p className="mt-3 text-sm text-forest-200">{formatMonthLabel(receipt.payment.month)} collection fee</p>
          </div>
          <dl className="space-y-4 p-6 text-sm sm:p-8">
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-stone-700">Resident</dt>
              <dd className="text-right font-black text-forest-950">{receipt.resident.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-stone-700">Phone</dt>
              <dd className="text-right font-black text-forest-950">{receipt.resident.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-stone-700">Property</dt>
              <dd className="text-right font-black text-forest-950">{receipt.property.addressLine}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-stone-700">Amount</dt>
              <dd className="text-right font-black text-forest-950">₹{receipt.payment.amountInr}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-stone-700">Paid at</dt>
              <dd className="text-right font-black text-forest-950">
                {receipt.payment.paidAt ? formatRecordedAt(receipt.payment.paidAt) : "Pending"}
              </dd>
            </div>
          </dl>
        </Card>
        <aside className="mt-6 rounded-control border border-marigold-300 bg-marigold-100 p-4 text-sm leading-6 text-forest-950">
          mock UPI — no real money moves, and no payment processor is involved.
        </aside>
      </div>
    </main>
  );
}
