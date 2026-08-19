"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CoordinatorLogin } from "@/components/coordinator/coordinator-login";

type LoginResponse = { next?: string; error?: { message?: string } };

export function CoordinatorLoginController({ devCode }: { devCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(devCode);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/coordinator/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const body = await response.json() as LoginResponse;
      if (!response.ok || !body.next) throw new Error(body.error?.message ?? "Could not open the collector queue.");
      router.replace(body.next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open the collector queue.");
      setBusy(false);
    }
  }

  return <CoordinatorLogin busy={busy} code={code} devCode={devCode} message={message} onCodeChange={setCode} onSubmit={submit} />;
}
