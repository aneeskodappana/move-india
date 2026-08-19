import type { DatabaseClient } from "@/db/client";
import type { NewPayment, Payment } from "@/db/schema";
import { createPaymentRepository } from "@/repositories/payment.repo";
import { createInsertHarness, createSelectListHarness, createSelectOneHarness } from "../../helpers/mock-database";

const expected: Payment = {
  id: "60000000-0000-4000-8000-000000000001",
  occupantId: "30000000-0000-4000-8000-000000000001",
  month: "2026-08",
  amountInr: 80,
  status: "pending",
  receiptId: "VN-RCP-202608-000001",
  paidAt: null,
};

describe("PaymentRepository", () => {
  it("inserts and returns a payment", async () => {
    const input: NewPayment = {
      occupantId: expected.occupantId,
      month: expected.month,
      amountInr: expected.amountInr,
      status: "pending",
      receiptId: expected.receiptId,
    };
    const harness = createInsertHarness(expected);

    await expect(createPaymentRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });

  it("finds a payment by receipt id and occupant month", async () => {
    const byReceipt = createSelectOneHarness([expected]);
    await expect(createPaymentRepository(byReceipt.database).findByReceiptId(expected.receiptId)).resolves.toEqual(expected);
    const byMonth = createSelectOneHarness([expected]);
    await expect(
      createPaymentRepository(byMonth.database).findByOccupantAndMonth(expected.occupantId, expected.month),
    ).resolves.toEqual(expected);
    expect(byMonth.limit).toHaveBeenCalledWith(1);
  });

  it("lists an occupant's payments newest first", async () => {
    const harness = createSelectListHarness([expected]);
    await expect(createPaymentRepository(harness.database).listByOccupant(expected.occupantId)).resolves.toEqual([
      expected,
    ]);
    expect(harness.orderBy).toHaveBeenCalledOnce();
  });

  it("records the mock payment timestamp and paid status", async () => {
    const paidAt = new Date("2026-08-19T05:30:00.000Z");
    const paid = { ...expected, status: "paid" as const, paidAt };
    const returning = vi.fn().mockResolvedValue([paid]);
    const where = vi.fn().mockReturnValue({ returning });
    const set = vi.fn().mockReturnValue({ where });
    const update = vi.fn().mockReturnValue({ set });
    const database = { update } as unknown as DatabaseClient;
    await expect(createPaymentRepository(database).markPaid(expected.id, paidAt)).resolves.toEqual(paid);
    expect(set).toHaveBeenCalledWith({ status: "paid", paidAt });
  });
});
