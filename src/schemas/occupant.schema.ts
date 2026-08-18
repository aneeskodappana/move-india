import { z } from "zod";
import { isoDateSchema, syntheticPhoneSchema, uuidSchema } from "@/schemas/common";

export const createOccupantInputSchema = z
  .object({
    id: uuidSchema.optional(),
    propertyId: uuidSchema,
    name: z.string().trim().min(2).max(120),
    phone: syntheticPhoneSchema,
    role: z.enum(["owner", "tenant"]),
    moveInDate: isoDateSchema,
    moveOutDate: isoDateSchema.nullable().optional(),
  })
  .refine(
    (value) => !value.moveOutDate || value.moveOutDate >= value.moveInDate,
    { message: "Move-out date cannot precede move-in date.", path: ["moveOutDate"] },
  );

export type CreateOccupantInput = z.infer<typeof createOccupantInputSchema>;
