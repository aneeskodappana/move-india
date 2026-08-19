export type JourneyStep = {
  title: string;
  description: string;
};

export type SamplePickup = {
  material: string;
  timeWindow: string;
  ward: string;
  route: string;
};

export type ServiceHighlight = {
  title: string;
  description: string;
};

export type AppFoundation = {
  serviceArea: readonly string[];
  samplePickup: SamplePickup;
  highlights: readonly ServiceHighlight[];
  journey: readonly JourneyStep[];
};

export const appFoundation: AppFoundation = {
  serviceArea: ["Elamkulam", "Kadavanthra", "Panampilly Nagar", "Thevara"],
  samplePickup: {
    material: "Food waste",
    timeWindow: "7:00–8:30 AM",
    ward: "Elamkulam",
    route: "Elamkulam North",
  },
  highlights: [
    {
      title: "Segregate for the day",
      description: "Food waste, plastic, or glass — shown before the vehicle arrives, so the right bag goes out.",
    },
    {
      title: "Handover at the kerb",
      description: "You mark waste kept out. The collector confirms collected. Two times stay on one address.",
    },
    {
      title: "Records that follow you",
      description: "Proof and receipts stay with the person who lives there, even in a shared building.",
    },
  ],
  journey: [
    {
      title: "Join your address",
      description: "Register as the owner or tenant who lives there now.",
    },
    {
      title: "See today’s pickup",
      description: "The material and time window appear on your home screen before the vehicle arrives.",
    },
    {
      title: "Confirm handover",
      description: "You mark waste kept out. The collector confirms collected as a separate time.",
    },
    {
      title: "Keep your records",
      description: "Open history, payments, and receipts whenever you need them.",
    },
  ],
};
