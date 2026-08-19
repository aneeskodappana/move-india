import { z } from "zod";
import { monthSchema, timestampSchema, uuidSchema } from "@/schemas/common";

export const receiptIdSchema = z
  .string()
  .regex(/^VN-RCP-\d{6}-[A-Z0-9]{6}$/, "Use a Vandi receipt id such as VN-RCP-202608-000001.");

export const createPaymentInputSchema = z
  .object({
    id: uuidSchema.optional(),
    occupantId: uuidSchema,
    month: monthSchema,
    amountInr: z.number().int().positive().max(10_000),
    status: z.enum(["paid", "pending"]).default("pending"),
    receiptId: receiptIdSchema,
    paidAt: timestampSchema.nullable().optional(),
  })
  .refine((value) => value.status !== "paid" || Boolean(value.paidAt), {
    message: "Paid records require a payment timestamp.",
    path: ["paidAt"],
  });

export type CreatePaymentInput = z.infer<typeof createPaymentInputSchema>;

export const receiptLookupSchema = z.object({
  receiptId: receiptIdSchema,
});

export type ReceiptLookup = z.infer<typeof receiptLookupSchema>;
