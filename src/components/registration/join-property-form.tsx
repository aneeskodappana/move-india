import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type PropertyOption = {
  id: string;
  addressLine: string;
  ward: string;
  occupants: Array<{ id: string; name: string; role: "owner" | "tenant" }>;
};

type JoinPropertyFormProps = {
  properties: PropertyOption[];
  propertyId: string;
  role: "owner" | "tenant";
  moveInDate: string;
  busy: boolean;
  message?: string;
  onPropertyChange(value: string): void;
  onRoleChange(value: "owner" | "tenant"): void;
  onMoveInDateChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
};

const inputClass = "mt-2 min-h-12 w-full rounded-control border border-stone-300 bg-white px-4 py-3 text-base text-forest-950 shadow-sm outline-none focus:border-forest-600";

export function JoinPropertyForm(props: JoinPropertyFormProps) {
  const selected = props.properties.find((property) => property.id === props.propertyId);
  const occupantCount = selected?.occupants.length ?? 0;

  return (
    <Card className="p-5 sm:p-7">
      <form className="space-y-6" onSubmit={props.onSubmit}>
        <label className="block text-sm font-bold text-forest-950">
          Mocked property and ward
          <select className={inputClass} onChange={(event) => props.onPropertyChange(event.target.value)} required value={props.propertyId}>
            <option disabled value="">Choose a synthetic address</option>
            {props.properties.map((property) => <option key={property.id} value={property.id}>{property.addressLine} · {property.ward}</option>)}
          </select>
        </label>

        {selected ? (
          <section aria-live="polite" className="rounded-card border border-forest-200 bg-forest-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Address check</p>
            <h2 className="mt-2 text-xl font-black text-forest-950">You’re joining {selected.addressLine} — {occupantCount} other {occupantCount === 1 ? "resident" : "residents"} already registered here.</h2>
            {occupantCount > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                {selected.occupants.map((occupant) => <li className="flex justify-between gap-4 border-t border-forest-200 pt-2" key={occupant.id}><span>{occupant.name}</span><span className="capitalize">{occupant.role}</span></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-stone-700">You’ll be the first demo resident at this address.</p>}
          </section>
        ) : null}

        <fieldset>
          <legend className="text-sm font-bold text-forest-950">Your role</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["tenant", "owner"] as const).map((role) => (
              <label className={`cursor-pointer rounded-control border p-4 text-center text-sm font-black capitalize ${props.role === role ? "border-forest-700 bg-forest-50 text-forest-950" : "border-stone-300 bg-white text-stone-700"}`} key={role}>
                <input checked={props.role === role} className="sr-only" name="role" onChange={() => props.onRoleChange(role)} type="radio" value={role} />
                {role}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-bold text-forest-950">
          Move-in date
          <input className={inputClass} max="2026-08-19" onChange={(event) => props.onMoveInDateChange(event.target.value)} required type="date" value={props.moveInDate} />
        </label>
        <Button className="w-full" disabled={props.busy || !selected} type="submit">{props.busy ? "Joining property…" : "Join this property"}</Button>
      </form>
      {props.message ? <p aria-live="polite" className="mt-5 rounded-control bg-marigold-100 p-3 text-sm font-bold text-forest-950">{props.message}</p> : null}
    </Card>
  );
}
