import { and, desc, eq } from "drizzle-orm";
import type { DatabaseClient } from "@/db/client";
import { withDatabaseRetry } from "@/db/retry";
import { payments, type NewPayment, type Payment } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createPaymentRepository(database: DatabaseClient) {
  return {
    async create(input: NewPayment): Promise<Payment> {
      const rows = await database.insert(payments).values(input).returning();
      return requireInsertedRow(rows, "Payment");
    },
    async findByReceiptId(receiptId: string): Promise<Payment | null> {
      const rows = await withDatabaseRetry("Payment receipt lookup", () =>
        database.select().from(payments).where(eq(payments.receiptId, receiptId)).limit(1),
      );
      return rows[0] ?? null;
    },
    async findByOccupantAndMonth(occupantId: string, month: string): Promise<Payment | null> {
      const rows = await withDatabaseRetry("Payment occupant-month lookup", () =>
        database
          .select()
          .from(payments)
          .where(and(eq(payments.occupantId, occupantId), eq(payments.month, month)))
          .limit(1),
      );
      return rows[0] ?? null;
    },
    async listByOccupant(occupantId: string): Promise<Payment[]> {
      return withDatabaseRetry("Payment occupant lookup", () =>
        database
          .select()
          .from(payments)
          .where(eq(payments.occupantId, occupantId))
          .orderBy(desc(payments.month)),
      );
    },
    async markPaid(id: string, paidAt: Date): Promise<Payment> {
      const rows = await database
        .update(payments)
        .set({ status: "paid", paidAt })
        .where(eq(payments.id, id))
        .returning();
      return requireInsertedRow(rows, "Payment");
    },
  };
}

export type PaymentRepository = ReturnType<typeof createPaymentRepository>;
