"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { JoinPropertyForm, type PropertyOption } from "@/components/registration/join-property-form";

type ApiError = { error?: { message?: string } };

export function JoinPropertyController({ initialProperties }: { initialProperties: PropertyOption[] }) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(() => {
    const twoResidentProperty = initialProperties.find((property) => property.occupants.length === 2);
    return twoResidentProperty?.id ?? initialProperties[0]?.id ?? "";
  });
  const [role, setRole] = useState<"owner" | "tenant">("tenant");
  const [moveInDate, setMoveInDate] = useState("2026-08-01");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  async function joinProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/occupants/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ propertyId, role, moveInDate }),
      });
      const body = await response.json() as ApiError & { next?: string };
      if (!response.ok || !body.next) throw new Error(body.error?.message ?? "Could not join the property.");
      router.push(body.next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not join the property.");
      setBusy(false);
    }
  }

  return <JoinPropertyForm busy={busy} message={message} moveInDate={moveInDate} onMoveInDateChange={setMoveInDate} onPropertyChange={setPropertyId} onRoleChange={setRole} onSubmit={joinProperty} properties={initialProperties} propertyId={propertyId} role={role} />;
}
