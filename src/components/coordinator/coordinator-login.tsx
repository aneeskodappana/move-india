import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CoordinatorLoginProps = {
  code: string;
  devCode: string;
  busy: boolean;
  message?: string;
  onCodeChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
};

export function CoordinatorLogin(props: CoordinatorLoginProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-forest-950 px-5 py-10">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center">
          <Link className="text-sm font-black uppercase tracking-[0.2em] text-marigold-300" href="/">Vandi · field operations</Link>
        </p>
        <Card className="p-6 sm:p-8">
          <span className="inline-flex rounded-full bg-marigold-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-forest-950">DEV collector mode</span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-forest-950">Collector confirmation</h1>
          <p className="mt-3 text-sm leading-6 text-stone-700">This console is for collection staff only. A resident sign-in cannot confirm pickup.</p>
          <div className="mt-5 rounded-control border border-marigold-300 bg-marigold-100 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-forest-700">Staff access code</p>
            <p className="mt-1 text-2xl font-black tracking-[0.25em] text-forest-950">{props.devCode}</p>
          </div>
          <form className="mt-6" onSubmit={props.onSubmit}>
            <label className="block text-sm font-bold text-forest-950">
              Six-digit collector code
              <input className="mt-2 min-h-12 w-full rounded-control border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-forest-600" inputMode="numeric" maxLength={6} onChange={(event) => props.onCodeChange(event.target.value)} required value={props.code} />
            </label>
            <Button className="mt-5 w-full" disabled={props.busy} type="submit">{props.busy ? "Opening…" : "Open today’s queue"}</Button>
          </form>
          {props.message ? <p aria-live="polite" className="mt-4 text-sm font-bold text-forest-700">{props.message}</p> : null}
        </Card>
      </div>
    </main>
  );
}
