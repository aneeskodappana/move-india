import { z } from "zod";
import { isoDateSchema, uuidSchema } from "@/schemas/common";

export const joinPropertyInputSchema = z.object({
  propertyId: uuidSchema,
  role: z.enum(["owner", "tenant"]),
  moveInDate: isoDateSchema,
});

export type JoinPropertyInput = z.infer<typeof joinPropertyInputSchema>;
