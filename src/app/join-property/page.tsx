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
    <AuthShell description="Pick an invented address, confirm who is already registered there, and link your verified occupant identity." eyebrow="Step 2 of 2" title={`Welcome, ${session.name}. Join your property.`}>
      <JoinPropertyController initialProperties={properties} />
    </AuthShell>
  );
}
