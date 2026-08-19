import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary";
};

export function Button({ className = "", tone = "primary", ...props }: ButtonProps) {
  const toneClass = tone === "primary"
    ? "bg-forest-900 text-white hover:bg-forest-800"
    : "border border-forest-200 bg-paper text-forest-900 hover:bg-forest-50";

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-control px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${className}`}
      {...props}
    />
  );
}
