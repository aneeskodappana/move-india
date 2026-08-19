import type { Payment, Property } from "@/db/schema";
import type { Session } from "@/lib/session";
import { createPaymentService, createReceiptId } from "@/services/payment.service";

const anjaliSession: Session = {
  version: 1,
  state: "registered",
  phone: "+91-00000-00002",
  name: "Anjali Nair",
  occupantId: "30000000-0000-4000-8000-000000000002",
  propertyId: "20000000-0000-4000-8000-000000000001",
  expiresAt: Date.now() + 60_000,
};
const property: Property = {
  id: anjaliSession.propertyId,
  addressLine: "Demo Lotus House, Lane 1",
  ward: "Elamkulam",
  mockQrId: "VN-EKM-01-1001",
  latitude: 9.9681,
  longitude: 76.2992,
  routeId: "10000000-0000-4000-8000-000000000001",
};
const now = new Date("2026-08-19T05:30:00.000Z");
const pending: Payment = {
  id: "60000000-0000-4000-8000-000000000002",
  occupantId: anjaliSession.occupantId,
  month: "2026-08",
  amountInr: 80,
  status: "pending",
  receiptId: "VN-RCP-202608-000002",
  paidAt: null,
};
const raviReceipt: Payment = {
  id: "60000000-0000-4000-8000-000000000001",
  occupantId: "30000000-0000-4000-8000-000000000001",
  month: "2026-07",
  amountInr: 80,
  status: "paid",
  receiptId: "VN-RCP-202607-000001",
  paidAt: new Date("2026-07-05T05:30:00.000Z"),
};

function dependencies(overrides: { current?: Payment | null; receipt?: Payment | null } = {}) {
  return {
    payments: {
      create: vi.fn().mockResolvedValue(pending),
      findByOccupantAndMonth: vi.fn().mockResolvedValue(overrides.current === undefined ? pending : overrides.current),
      findByReceiptId: vi.fn().mockResolvedValue(overrides.receipt === undefined ? pending : overrides.receipt),
      listByOccupant: vi.fn().mockResolvedValue(overrides.current === undefined ? [pending] : overrides.current ? [overrides.current] : []),
      markPaid: vi.fn(),
    },
    properties: { findById: vi.fn().mockResolvedValue(property) },
  };
}

describe("PaymentService", () => {
  it("creates a pending current-month ledger row and serializes receipts", async () => {
    const deps = dependencies({ current: null });
    const service = createPaymentService(deps);
    await expect(service.getLedger(anjaliSession, now)).resolves.toMatchObject({
      currentMonth: "2026-08",
      current: { amountInr: 80, status: "pending", receiptId: pending.receiptId },
    });
    expect(deps.payments.create).toHaveBeenCalledWith(
      expect.objectContaining({
        occupantId: anjaliSession.occupantId,
        month: "2026-08",
        amountInr: 80,
        status: "pending",
        receiptId: createReceiptId("2026-08", anjaliSession.occupantId),
      }),
    );
  });

  it("records a mock UPI payment only for the signed-in occupant", async () => {
    const paid = { ...pending, status: "paid" as const, paidAt: now };
    const deps = dependencies();
    deps.payments.markPaid.mockResolvedValue(paid);
    await expect(createPaymentService(deps).payCurrentMonth(anjaliSession, now)).resolves.toEqual({
      id: pending.id,
      month: "2026-08",
      amountInr: 80,
      status: "paid",
      receiptId: pending.receiptId,
      paidAt: now.toISOString(),
    });
    expect(deps.payments.findByOccupantAndMonth).toHaveBeenCalledWith(anjaliSession.occupantId, "2026-08");
    expect(deps.payments.markPaid).toHaveBeenCalledWith(pending.id, now);
  });

  it("critically blocks Anjali from viewing Ravi's receipt", async () => {
    const deps = dependencies({ receipt: raviReceipt });
    await expect(createPaymentService(deps).getReceipt(anjaliSession, raviReceipt.receiptId)).rejects.toMatchObject({
      code: "forbidden",
      status: 403,
    });
    expect(deps.properties.findById).not.toHaveBeenCalled();
  });

  it("returns Anjali's own paid receipt with property context", async () => {
    const own = { ...pending, status: "paid" as const, paidAt: now };
    const deps = dependencies({ receipt: own });
    await expect(createPaymentService(deps).getReceipt(anjaliSession, own.receiptId)).resolves.toMatchObject({
      resident: { name: "Anjali Nair", phone: "+91-00000-00002" },
      property: { addressLine: property.addressLine },
      payment: { receiptId: own.receiptId, paidAt: now.toISOString() },
    });
  });
});
