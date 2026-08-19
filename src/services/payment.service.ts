import { createHash } from "node:crypto";
import { AppError } from "@/lib/app-error";
import { indiaYearMonth } from "@/lib/india-date";
import type { Session } from "@/lib/session";
import type { Payment } from "@/db/schema";
import type { PaymentRepository } from "@/repositories/payment.repo";
import type { PropertyRepository } from "@/repositories/property.repo";

export const MONTHLY_COLLECTION_FEE_INR = 80;

type PaymentServiceDependencies = {
  payments: Pick<
    PaymentRepository,
    "create" | "findByOccupantAndMonth" | "findByReceiptId" | "listByOccupant" | "markPaid"
  >;
  properties: Pick<PropertyRepository, "findById">;
};

function requireRegisteredResident(session: Session): Extract<Session, { state: "registered" }> {
  if (session.state !== "registered") {
    throw new AppError("forbidden", "Join a property before viewing payments.", 403);
  }
  return session;
}

export function createReceiptId(month: string, occupantId: string): string {
  const stamp = month.replaceAll("-", "");
  const suffix = createHash("sha256")
    .update(`vandi-receipt:${occupantId}:${month}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  return `VN-RCP-${stamp}-${suffix}`;
}

export function serializePayment(payment: Payment) {
  return {
    id: payment.id,
    month: payment.month,
    amountInr: payment.amountInr,
    status: payment.status,
    receiptId: payment.receiptId,
    paidAt: payment.paidAt?.toISOString() ?? null,
  };
}

export type SerializedPayment = ReturnType<typeof serializePayment>;

async function ensureCurrentMonthPayment(
  dependencies: PaymentServiceDependencies,
  occupantId: string,
  month: string,
): Promise<Payment> {
  const existing = await dependencies.payments.findByOccupantAndMonth(occupantId, month);
  if (existing) return existing;

  return dependencies.payments.create({
    occupantId,
    month,
    amountInr: MONTHLY_COLLECTION_FEE_INR,
    status: "pending",
    receiptId: createReceiptId(month, occupantId),
  });
}

export function createPaymentService(dependencies: PaymentServiceDependencies) {
  return {
    async getLedger(session: Session, now = new Date()) {
      const resident = requireRegisteredResident(session);
      const currentMonth = indiaYearMonth(now);
      const current = await ensureCurrentMonthPayment(
        dependencies,
        resident.occupantId,
        currentMonth,
      );
      const rows = await dependencies.payments.listByOccupant(resident.occupantId);
      const payments = rows.some((row) => row.id === current.id) ? rows : [current, ...rows];

      return {
        resident: { name: resident.name },
        currentMonth,
        current: serializePayment(current),
        payments: payments
          .slice()
          .sort((left, right) => right.month.localeCompare(left.month))
          .map(serializePayment),
      };
    },

    async payCurrentMonth(session: Session, now = new Date()) {
      const resident = requireRegisteredResident(session);
      const month = indiaYearMonth(now);
      const existing = await ensureCurrentMonthPayment(dependencies, resident.occupantId, month);
      if (existing.occupantId !== resident.occupantId) {
        throw new AppError("forbidden", "You can only pay your own collection fee.", 403);
      }
      if (existing.status === "paid" && existing.paidAt) {
        return serializePayment(existing);
      }

      return serializePayment(await dependencies.payments.markPaid(existing.id, now));
    },

    async getReceipt(session: Session, receiptId: string) {
      const resident = requireRegisteredResident(session);
      const payment = await dependencies.payments.findByReceiptId(receiptId);
      if (!payment) {
        throw new AppError("not_found", "That receipt was not found.", 404);
      }
      if (payment.occupantId !== resident.occupantId) {
        throw new AppError("forbidden", "You can only view your own receipts.", 403);
      }
      if (payment.status !== "paid") {
        throw new AppError("not_found", "That receipt was not found.", 404);
      }

      const property = await dependencies.properties.findById(resident.propertyId);
      if (!property) {
        throw new AppError("not_found", "Your registered property was not found.", 404);
      }

      return {
        resident: { name: resident.name, phone: resident.phone },
        property: { addressLine: property.addressLine, ward: property.ward },
        payment: serializePayment(payment),
      };
    },
  };
}

export type PaymentService = ReturnType<typeof createPaymentService>;
export type PaymentLedgerView = Awaited<ReturnType<PaymentService["getLedger"]>>;
export type PaymentReceiptView = Awaited<ReturnType<PaymentService["getReceipt"]>>;
