import { redirect } from "next/navigation";
import { SignUpController } from "@/app/sign-up/sign-up-controller";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSession } from "@/lib/current-session";

export default async function SignUpPage() {
  const session = await getCurrentSession();
  if (session?.state === "registered") redirect("/home");
  if (session?.state === "verified") redirect("/join-property");

  return (
    <AuthShell description="Your collection record belongs to you — not only to the owner or the household QR." eyebrow="Sign in" title="Sign in as the person who lives here.">
      <SignUpController />
    </AuthShell>
  );
}
