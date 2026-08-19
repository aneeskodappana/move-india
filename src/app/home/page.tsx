import { redirect } from "next/navigation";
import { TodayDashboard } from "@/components/resident/today-dashboard";
import { getCurrentSession } from "@/lib/current-session";
import { indiaIsoDate } from "@/lib/india-date";
import { createApplicationServices } from "@/services/dependencies";

export default async function ResidentHomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "verified") redirect("/join-property");
  const today = await createApplicationServices().today.getForResident(session, indiaIsoDate());
  return <TodayDashboard today={today} />;
}
