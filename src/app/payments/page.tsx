import { redirect } from "next/navigation";
import { PaymentController } from "@/app/payments/payment-controller";
import { getCurrentSession } from "@/lib/current-session";
import { createApplicationServices } from "@/services/dependencies";

export default async function PaymentsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "verified") redirect("/join-property");
  const ledger = await createApplicationServices().payments.getLedger(session);
  return <PaymentController initialLedger={ledger} />;
}
