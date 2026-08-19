"use client";

import { Button } from "@/components/ui/button";

export function PrintProofButton({ label }: { label: string }) {
  return (
    <Button className="print-hidden" onClick={() => window.print()} tone="secondary" type="button">
      {label}
    </Button>
  );
}
