import type { NewPayment, Payment } from "@/db/schema";
import { createPaymentRepository } from "@/repositories/payment.repo";
import { createInsertHarness } from "../../helpers/mock-database";

describe("PaymentRepository", () => {
  it("inserts and returns a payment", async () => {
    const input: NewPayment = {
      occupantId: "30000000-0000-4000-8000-000000000001",
      month: "2026-08",
      amountInr: 80,
      status: "pending",
      receiptId: "VN-RCP-202608-000001",
    };
    const expected: Payment = {
      id: "60000000-0000-4000-8000-000000000001",
      ...input,
      status: "pending",
      paidAt: null,
    };
    const harness = createInsertHarness(expected);

    await expect(createPaymentRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });
});
