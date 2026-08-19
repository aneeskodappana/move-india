"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentLedger } from "@/components/resident/payment-ledger";
import type { PaymentLedgerView, SerializedPayment } from "@/services/payment.service";

type PayResponse = {
  payment?: SerializedPayment;
  error?: { message?: string };
};

export function PaymentController({ initialLedger }: { initialLedger: PaymentLedgerView }) {
  const router = useRouter();
  const [ledger, setLedger] = useState(initialLedger);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  async function pay() {
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/payments/pay", { method: "POST" });
      const body = await response.json() as PayResponse;
      if (!response.ok || !body.payment) {
        throw new Error(body.error?.message ?? "Could not record the mock payment.");
      }
      setLedger((current) => ({
        ...current,
        current: body.payment ?? current.current,
        payments: current.payments.map((payment) =>
          payment.id === body.payment?.id ? (body.payment ?? payment) : payment,
        ),
      }));
      setMessage("Mock UPI payment recorded. Your receipt is ready.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record the mock payment.");
    } finally {
      setBusy(false);
    }
  }

  return <PaymentLedger busy={busy} ledger={ledger} message={message} onPay={pay} />;
}
