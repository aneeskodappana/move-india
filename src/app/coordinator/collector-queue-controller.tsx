"use client";

import { useState } from "react";
import { CollectorQueue } from "@/components/coordinator/collector-queue";
import type { PendingCollectorView } from "@/services/handover.service";

type ConfirmResponse = { handover?: { status: string }; error?: { message?: string } };

export function CollectorQueueController({ dateLabel, initialItems }: { dateLabel: string; initialItems: PendingCollectorView[] }) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function confirm(id: string) {
    setBusyId(id);
    setMessage(undefined);
    try {
      const response = await fetch("/api/handovers/collected", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handoverLogId: id }) });
      const body = await response.json() as ConfirmResponse;
      if (!response.ok || body.handover?.status !== "collected") throw new Error(body.error?.message ?? "Could not confirm collection.");
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Collection confirmed with a separate collector timestamp.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not confirm collection.");
    } finally {
      setBusyId(undefined);
    }
  }

  return <CollectorQueue busyId={busyId} dateLabel={dateLabel} items={items} message={message} onConfirm={confirm} />;
}
