import type { DatabaseClient } from "@/db/client";
import { payments, type NewPayment, type Payment } from "@/db/schema";
import { requireInsertedRow } from "@/repositories/insert-result";

export function createPaymentRepository(database: DatabaseClient) {
  return {
    async create(input: NewPayment): Promise<Payment> {
      const rows = await database.insert(payments).values(input).returning();
      return requireInsertedRow(rows, "Payment");
    },
  };
}

export type PaymentRepository = ReturnType<typeof createPaymentRepository>;
