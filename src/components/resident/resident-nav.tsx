import Link from "next/link";

const links = [
  { href: "/home", id: "today", label: "Today" },
  { href: "/history", id: "history", label: "History" },
  { href: "/payments", id: "payments", label: "Payments" },
] as const;

export type ResidentNavCurrent = (typeof links)[number]["id"];

export function ResidentNav({
  current,
  name,
  location,
  title = "Resident record",
}: {
  current: ResidentNavCurrent;
  name: string;
  location?: string;
  title?: string;
}) {
  return (
    <header className="border-b border-forest-200 pb-5 print:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-control bg-forest-900 font-black text-white">V</span>
          <div className="min-w-0">
            <p className="font-black text-forest-950">Vandi</p>
            <p className="truncate text-xs text-stone-700">{title}</p>
          </div>
        </div>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-black text-forest-950">{name}</p>
          {location ? <p className="truncate text-xs text-stone-500">{location}</p> : null}
        </div>
      </div>
      <nav aria-label="Resident sections" className="mt-4 grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = link.id === current;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-12 items-center justify-center rounded-control px-2 text-sm font-black ${
                active ? "bg-forest-900 text-white" : "border border-forest-200 bg-paper text-forest-900"
              }`}
              href={link.href}
              key={link.id}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
