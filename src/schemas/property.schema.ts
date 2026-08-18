import { z } from "zod";
import { mockQrIdSchema, uuidSchema } from "@/schemas/common";

export const createPropertyInputSchema = z.object({
  id: uuidSchema.optional(),
  addressLine: z.string().trim().min(8).max(255),
  ward: z.string().trim().min(2).max(100),
  mockQrId: mockQrIdSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  routeId: uuidSchema,
});

export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;
