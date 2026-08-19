import { redirect } from "next/navigation";
import { JoinPropertyController } from "@/app/join-property/join-property-controller";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/current-session";
import { createApplicationServices } from "@/services/dependencies";

export default async function JoinPropertyPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-up");
  if (session.state === "registered") redirect("/home");
  const properties = await createApplicationServices().properties.listJoinOptions();

  return (
    <AuthShell description="Choose your building, see who already lives there, and attach your account to that address." eyebrow="Join your building" title={`Welcome, ${session.name}. Add your address.`}>
      <JoinPropertyController initialProperties={properties} />
    </AuthShell>
  );
}
