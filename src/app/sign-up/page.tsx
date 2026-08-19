import { redirect } from "next/navigation";
import { SignUpController } from "@/app/sign-up/sign-up-controller";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/current-session";

export default async function SignUpPage() {
  const session = await getCurrentSession();
  if (session?.state === "registered") redirect("/home");
  if (session?.state === "verified") redirect("/join-property");

  return (
    <AuthShell description="Create an occupant identity first. Your record follows you—not just the property owner or household QR." eyebrow="Step 1 of 2" title="Sign up as the person who lives here.">
      <SignUpController />
    </AuthShell>
  );
}
