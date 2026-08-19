import { fireEvent, render, screen } from "@testing-library/react";
import { CollectorQueue } from "@/components/coordinator/collector-queue";
import { ResidentHandoverCard } from "@/components/handover/resident-handover-card";

const baseProps = {
  busy: false,
  photoUrl: "",
  onMarkKeptOut: vi.fn(),
  onPhotoUrlChange: vi.fn(),
  onRefresh: vi.fn(),
};

describe("M4 handover components", () => {
  it("offers the resident kept-out action and optional proof URL", () => {
    render(<ResidentHandoverCard {...baseProps} handover={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark kept out now" }));
    expect(baseProps.onMarkKeptOut).toHaveBeenCalled();
    expect(screen.getByLabelText("Optional photo link")).toBeInTheDocument();
  });

  it("shows both timestamps when the two-sided record is complete", () => {
    render(<ResidentHandoverCard {...baseProps} handover={{ id: "50000000-0000-4000-8000-000000000001", status: "collected", residentMarkedAt: "2026-08-19T02:00:00.000Z", collectorMarkedAt: "2026-08-19T02:20:00.000Z", photoUrl: null }} />);
    expect(screen.getByRole("heading", { name: "Proof record complete" })).toBeInTheDocument();
    expect(screen.getByText(/both sides/i)).toBeInTheDocument();
  });

  it("gives the DEV collector a separate confirmation action", () => {
    const onConfirm = vi.fn();
    render(<CollectorQueue dateLabel="Wednesday, 19 August" items={[{ id: "50000000-0000-4000-8000-000000000001", residentName: "Anjali Nair", addressLine: "Demo Lotus House, Lane 1", ward: "Elamkulam", routeName: "Demo Elamkulam North", materialType: "Food waste", timeWindow: "7:00–8:30 AM", residentMarkedAt: "2026-08-19T02:00:00.000Z", photoUrl: null }]} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark collected" }));
    expect(onConfirm).toHaveBeenCalledWith("50000000-0000-4000-8000-000000000001");
    expect(screen.getByText("DEV collector mode")).toBeInTheDocument();
  });
});
