import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SerializedHandover } from "@/services/handover.service";

type ResidentHandoverCardProps = {
  handover: SerializedHandover | null;
  photoUrl: string;
  busy: boolean;
  message?: string;
  onMarkKeptOut(): void;
  onPhotoUrlChange(value: string): void;
  onRefresh(): void;
};

function formatHandoverTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp));
}

export function ResidentHandoverCard(props: ResidentHandoverCardProps) {
  if (!props.handover) {
    return (
      <Card className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Handover record</p>
        <h2 className="mt-2 text-2xl font-black text-forest-950">Waste is outside?</h2>
        <p className="mt-3 text-sm leading-6 text-stone-700">Create your timestamp first. The collector confirms pickup separately.</p>
        <label className="mt-5 block text-sm font-bold text-forest-950">
          Optional photo link
          <input
            className="mt-2 min-h-12 w-full rounded-control border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-forest-600"
            onChange={(event) => props.onPhotoUrlChange(event.target.value)}
            placeholder="https://"
            type="url"
            value={props.photoUrl}
          />
        </label>
        <Button className="mt-5 w-full" disabled={props.busy} onClick={props.onMarkKeptOut}>
          {props.busy ? "Recording…" : "Mark kept out now"}
        </Button>
        {props.message ? <p aria-live="polite" className="mt-4 text-sm font-bold text-forest-700">{props.message}</p> : null}
      </Card>
    );
  }

  const collected = props.handover.status === "collected" && props.handover.collectorMarkedAt;
  return (
    <Card className="overflow-hidden">
      <div className="bg-forest-50 p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Handover record</p>
        <h2 className="mt-2 text-2xl font-black text-forest-950">
          {collected ? "Proof record complete" : "Kept out recorded"}
        </h2>
        <p className="mt-2 text-sm text-stone-700">
          {collected ? "Both sides have now confirmed this handover." : "Waiting for a separate collector confirmation."}
        </p>
      </div>
      <dl className="space-y-4 p-6 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="font-bold text-stone-700">Resident</dt>
          <dd className="text-right font-black text-forest-950">{formatHandoverTime(props.handover.residentMarkedAt)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-stone-100 pt-4">
          <dt className="font-bold text-stone-700">Collector</dt>
          <dd className="text-right font-black text-forest-950">
            {props.handover.collectorMarkedAt ? formatHandoverTime(props.handover.collectorMarkedAt) : "Awaiting confirmation"}
          </dd>
        </div>
      </dl>
      <div className="grid gap-3 border-t border-stone-100 p-5 sm:grid-cols-2">
        {!collected ? <Link className="inline-flex min-h-12 items-center justify-center rounded-control border border-forest-200 px-4 text-sm font-black text-forest-900" href="/coordinator">Collector sign-in</Link> : null}
        <Button className={collected ? "w-full sm:col-span-2" : "w-full"} disabled={props.busy} onClick={props.onRefresh} tone="secondary">{props.busy ? "Refreshing…" : "Refresh status"}</Button>
      </div>
    </Card>
  );
}
