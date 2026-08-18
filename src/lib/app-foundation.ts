export type FoundationGate = {
  label: string;
  command: string;
  status: "ready" | "queued";
};

export type JourneyStep = {
  title: string;
  description: string;
};

export type AppFoundation = {
  gates: readonly FoundationGate[];
  journey: readonly JourneyStep[];
};

export const appFoundation: AppFoundation = {
  gates: [
    { label: "Strict types", command: "typecheck", status: "ready" },
    { label: "Unit tests", command: "test", status: "ready" },
    { label: "Production build", command: "build", status: "ready" },
  ],
  journey: [
    {
      title: "Join your address",
      description: "Register as the current owner or tenant without replacing the property record.",
    },
    {
      title: "See today’s pickup",
      description: "Read one material and time-window message across app, SMS, and WhatsApp previews.",
    },
    {
      title: "Confirm handover",
      description: "Pair the resident’s kept-out time with the collector’s collected time.",
    },
    {
      title: "Keep your proof",
      description: "Review collection history, payment status, and digital receipts in one place.",
    },
  ],
};
