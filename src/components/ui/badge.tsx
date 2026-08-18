import type { HTMLAttributes } from "react";

type BadgeTone = "forest" | "marigold" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  forest: "border-forest-200 bg-forest-50 text-forest-800",
  marigold: "border-marigold-300 bg-marigold-100 text-forest-950",
  neutral: "border-stone-300 bg-paper text-stone-700",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className = "", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
