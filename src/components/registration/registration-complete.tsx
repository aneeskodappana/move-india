import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type RegistrationCompleteProps = {
  name: string;
  phone: string;
};

export function RegistrationComplete({ name, phone }: RegistrationCompleteProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 py-10">
      <Card className="w-full max-w-2xl p-7 text-center sm:p-10">
        <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-forest-900 text-3xl font-black text-white">✓</span>
        <Badge className="mt-6" tone="forest">Registration complete</Badge>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-forest-950">You’re registered, {name}.</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-stone-700">Your account <span className="font-mono">{phone}</span> is now linked to your address. Today’s collection update will appear on your home screen.</p>
      </Card>
    </main>
  );
}
