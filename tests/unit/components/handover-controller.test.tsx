import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HandoverController } from "@/app/home/handover-controller";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("HandoverController", () => {
  it("replaces stale resident state with the collector-confirmed API record", async () => {
    const collected = {
      id: "50000000-0000-4000-8000-000000000001",
      status: "collected" as const,
      residentMarkedAt: "2026-08-19T02:00:00.000Z",
      collectorMarkedAt: "2026-08-19T02:20:00.000Z",
      photoUrl: null,
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ today: { handover: collected } }),
    }));

    render(
      <HandoverController
        collectionEventId="40000000-0000-4000-8000-000000000001"
        initialHandover={{ ...collected, status: "kept_out", collectorMarkedAt: null }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Kept out recorded" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Refresh status" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Proof record complete" })).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith("/api/today", { cache: "no-store" });
    expect(refresh).toHaveBeenCalled();
  });
});
