import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-stone-100 bg-paper shadow-card ${className}`}
      {...props}
    />
  );
}
