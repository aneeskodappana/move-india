import { notFound, redirect } from "next/navigation";
import { PaymentReceipt, ReceiptAccessDenied } from "@/components/resident/payment-receipt";
import { AppError } from "@/lib/app-error";
import { getCurrentSession } from "@/lib/current-session";
import { receiptLookupSchema } from "@/schemas/payment.schema";
import { createApplicationServices } from "@/services/dependencies";
import type { PaymentReceiptView } from "@/services/payment.service";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "verified") redirect("/join-property");

  const { receiptId } = await params;
  const parsed = receiptLookupSchema.safeParse({ receiptId: decodeURIComponent(receiptId) });
  if (!parsed.success) notFound();

  let receipt: PaymentReceiptView | undefined;
  let denied = false;
  try {
    receipt = await createApplicationServices().payments.getReceipt(session, parsed.data.receiptId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    if (error instanceof AppError && error.code === "forbidden") {
      denied = true;
    } else {
      throw error;
    }
  }

  if (denied || !receipt) return <ReceiptAccessDenied />;
  return <PaymentReceipt receipt={receipt} />;
}
