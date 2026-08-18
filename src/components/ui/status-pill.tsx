type StatusPillProps = {
  label: string;
  status: "ready" | "queued";
};

export function StatusPill({ label, status }: StatusPillProps) {
  const dotClass = status === "ready" ? "bg-forest-500" : "bg-marigold-500";

  return (
    <span className="inline-flex items-center gap-2 text-sm font-bold text-stone-700">
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
