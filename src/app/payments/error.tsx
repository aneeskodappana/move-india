"use client";

import { Button } from "@/components/ui/button";

export default function PaymentsError({ reset }: { error: Error & { digest?: string }; reset(): void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-5 text-center">
      <div className="max-w-md">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Temporary connection issue</p>
        <h1 className="mt-3 text-4xl font-black text-forest-950">Payments couldn’t load.</h1>
        <p className="mt-4 leading-7 text-stone-700">The synthetic database may be waking up. Retry the read without losing your session.</p>
        <Button className="mt-6" onClick={reset}>Retry payments</Button>
      </div>
    </main>
  );
}
