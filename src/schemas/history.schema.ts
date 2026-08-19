import { z } from "zod";
import { monthSchema } from "@/schemas/common";

export const historyQuerySchema = z.object({
  month: monthSchema.optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
