import { redirect } from "next/navigation";
import { RegistrationComplete } from "@/components/registration/registration-complete";
import { getCurrentSession } from "@/lib/current-session";

export default async function ResidentHomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "verified") redirect("/join-property");
  return <RegistrationComplete name={session.name} phone={session.phone} />;
}
