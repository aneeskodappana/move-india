"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResidentHandoverCard } from "@/components/handover/resident-handover-card";
import type { SerializedHandover } from "@/services/handover.service";

type ApiResponse = {
  handover?: SerializedHandover;
  error?: { message?: string };
};

export function HandoverController({
  collectionEventId,
  initialHandover,
}: {
  collectionEventId: string;
  initialHandover: SerializedHandover | null;
}) {
  const router = useRouter();
  const [handover, setHandover] = useState(initialHandover);
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  async function markKeptOut() {
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/handovers/kept-out", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          collectionEventId,
          ...(photoUrl ? { photoUrl } : {}),
        }),
      });
      const body = await response.json() as ApiResponse;
      if (!response.ok || !body.handover) {
        throw new Error(body.error?.message ?? "Could not record the handover.");
      }
      setHandover(body.handover);
      setMessage("Your kept-out timestamp is saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record the handover.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResidentHandoverCard
      busy={busy}
      handover={handover}
      message={message}
      onMarkKeptOut={markKeptOut}
      onPhotoUrlChange={setPhotoUrl}
      onRefresh={() => router.refresh()}
      photoUrl={photoUrl}
    />
  );
}
