import { z } from "zod";
import { timestampSchema, uuidSchema } from "@/schemas/common";

export const createGrievanceInputSchema = z.object({
  id: uuidSchema.optional(),
  occupantId: uuidSchema,
  handoverLogId: uuidSchema,
  description: z.string().trim().min(10).max(1_000),
  status: z.enum(["open", "under_review", "closed"]).default("open"),
  filedAt: timestampSchema.optional(),
});

export type CreateGrievanceInput = z.infer<typeof createGrievanceInputSchema>;
