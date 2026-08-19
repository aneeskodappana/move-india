import { fireEvent, render, screen } from "@testing-library/react";
import { PaymentLedger } from "@/components/resident/payment-ledger";
import { PaymentReceipt } from "@/components/resident/payment-receipt";
import type { PaymentLedgerView, PaymentReceiptView } from "@/services/payment.service";

const ledger: PaymentLedgerView = {
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
    {
      id: "60000000-0000-4000-8000-000000000007",
      month: "2026-07",
      amountInr: 80,
      status: "paid",
      receiptId: "VN-RCP-202607-000005",
      paidAt: "2026-07-05T05:30:00.000Z",
    },
  ],
};

const receipt: PaymentReceiptView = {
  resident: { name: "Anjali Nair", phone: "+91-00000-00002" },
  property: { addressLine: "Demo Lotus House, Lane 1", ward: "Elamkulam" },
  payment: {
    id: "60000000-0000-4000-8000-000000000007",
    month: "2026-07",
    amountInr: 80,
    status: "paid",
    receiptId: "VN-RCP-202607-000005",
    paidAt: "2026-07-05T05:30:00.000Z",
  },
};

describe("M5 payment components", () => {
  it("offers a labeled mock Pay action and a receipt list", () => {
    const onPay = vi.fn();
    render(<PaymentLedger busy={false} ledger={ledger} onPay={onPay} />);
    fireEvent.click(screen.getByRole("button", { name: "Pay ₹80" }));
    expect(onPay).toHaveBeenCalled();
    expect(screen.getByText(/mock UPI/i)).toBeInTheDocument();
    expect(screen.getByText("VN-RCP-202607-000005")).toBeInTheDocument();
  });

  it("renders a downloadable digital receipt with the mock-payment disclosure", () => {
    render(<PaymentReceipt receipt={receipt} />);
    expect(screen.getByRole("heading", { name: "VN-RCP-202607-000005" })).toBeInTheDocument();
    expect(screen.getByText("Anjali Nair")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Print receipt" })).toBeInTheDocument();
    expect(screen.getByText(/no real money moves/i)).toBeInTheDocument();
  });
});
