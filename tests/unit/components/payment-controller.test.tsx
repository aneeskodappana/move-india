import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PaymentController } from "@/app/payments/payment-controller";
import type { PaymentLedgerView } from "@/services/payment.service";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const initialLedger: PaymentLedgerView = {
  resident: { name: "Anjali Nair" },
  currentMonth: "2026-08",
  current: {
    id: "60000000-0000-4000-8000-000000000008",
    month: "2026-08",
    amountInr: 80,
    status: "pending",
    receiptId: "VN-RCP-202608-ABCDEF",
    paidAt: null,
  },
  payments: [
    {
      id: "60000000-0000-4000-8000-000000000008",
      month: "2026-08",
      amountInr: 80,
      status: "pending",
      receiptId: "VN-RCP-202608-ABCDEF",
      paidAt: null,
    },
  ],
};

describe("PaymentController", () => {
  it("replaces the pending month with the mock paid receipt", async () => {
    const paid = {
      ...initialLedger.current,
      status: "paid" as const,
      paidAt: "2026-08-19T05:30:00.000Z",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ payment: paid }),
    }));

    render(<PaymentController initialLedger={initialLedger} />);
    fireEvent.click(screen.getByRole("button", { name: "Pay ₹80" }));
    await waitFor(() => expect(screen.getByText(/receipt is ready/i)).toBeInTheDocument());
    expect(screen.getByText(/View receipt VN-RCP-202608-ABCDEF/)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/payments/pay", { method: "POST" });
    expect(refresh).toHaveBeenCalled();
  });
});
