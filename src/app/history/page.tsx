import { redirect } from "next/navigation";
import { HistoryProofPack } from "@/components/resident/history-proof-pack";
import { getCurrentSession } from "@/lib/current-session";
import { historyQuerySchema } from "@/schemas/history.schema";
import { createApplicationServices } from "@/services/dependencies";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "verified") redirect("/join-property");

  const rawMonth = (await searchParams).month;
  const month = Array.isArray(rawMonth) ? rawMonth[0] : rawMonth;
  const parsed = historyQuerySchema.safeParse({ month });
  const pack = await createApplicationServices().history.getProofPack(
    session,
    parsed.success ? parsed.data.month : undefined,
  );
  return <HistoryProofPack pack={pack} />;
}
