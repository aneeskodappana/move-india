import { z } from "zod";
import { isoDateSchema, uuidSchema } from "@/schemas/common";

export const createCollectionEventInputSchema = z.object({
  id: uuidSchema.optional(),
  routeId: uuidSchema,
  propertyId: uuidSchema,
  eventDate: isoDateSchema,
  materialType: z.string().trim().min(2).max(100),
  timeWindow: z.string().trim().min(5).max(80),
  status: z.enum(["scheduled", "in_progress", "completed"]).default("scheduled"),
});

export type CreateCollectionEventInput = z.infer<typeof createCollectionEventInputSchema>;
