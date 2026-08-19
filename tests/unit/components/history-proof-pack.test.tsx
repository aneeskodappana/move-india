import { render, screen } from "@testing-library/react";
import { HistoryProofPack } from "@/components/resident/history-proof-pack";
import type { ProofPackView } from "@/services/history.service";

const pack: ProofPackView = {
  resident: { name: "Anjali Nair", phone: "+91-00000-00002" },
  property: {
    id: "20000000-0000-4000-8000-000000000001",
    addressLine: "Demo Lotus House, Lane 1",
    ward: "Elamkulam",
  },
  month: "2026-08",
  months: ["2026-08", "2026-07"],
  collections: [
    {
      collectionEventId: "40000000-0000-4000-8000-000000000018",
      eventDate: "2026-08-18",
      materialType: "Plastic and dry waste",
      timeWindow: "7:30–9:00 AM",
      handover: {
        id: "50000000-0000-4000-8000-000000000018",
        status: "collected",
        residentMarkedAt: "2026-08-18T02:05:00.000Z",
        collectorMarkedAt: "2026-08-18T03:00:00.000Z",
        photoUrl: null,
      },
    },
    {
      collectionEventId: "40000000-0000-4000-8000-000000000013",
      eventDate: "2026-08-13",
      materialType: "Food waste",
      timeWindow: "7:00–8:30 AM",
      handover: {
        id: "50000000-0000-4000-8000-000000000013",
        status: "kept_out",
        residentMarkedAt: "2026-08-13T02:05:00.000Z",
        collectorMarkedAt: null,
        photoUrl: null,
      },
    },
  ],
  payments: [
    {
      id: "60000000-0000-4000-8000-000000000008",
      month: "2026-08",
      amountInr: 80,
      status: "paid",
      receiptId: "VN-RCP-202608-000006",
      paidAt: "2026-08-05T05:30:00.000Z",
    },
  ],
};

describe("HistoryProofPack", () => {
  it("shows handover timestamps, the missing collector gap, receipts, and a print control", () => {
    render(<HistoryProofPack pack={pack} />);
    expect(screen.getByRole("heading", { name: "Proof pack" })).toBeInTheDocument();
    expect(screen.getByText("Plastic and dry waste")).toBeInTheDocument();
    expect(screen.getByText("Collector confirmation missing")).toBeInTheDocument();
    expect(screen.getByText("Receipt VN-RCP-202608-000006")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Print proof pack" })).toBeInTheDocument();
    expect(screen.getByText(/No real money moves/i)).toBeInTheDocument();
  });
});
