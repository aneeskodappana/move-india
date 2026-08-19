import { z } from "zod";
import { timestampSchema, uuidSchema } from "@/schemas/common";

export const createHandoverLogInputSchema = z
  .object({
    id: uuidSchema.optional(),
    occupantId: uuidSchema,
    collectionEventId: uuidSchema,
    residentMarkedAt: timestampSchema,
    collectorMarkedAt: timestampSchema.nullable().optional(),
    photoUrl: z.string().url().nullable().optional(),
    status: z.enum(["kept_out", "collected", "missed", "disputed"]).default("kept_out"),
  })
  .refine(
    (value) => !value.collectorMarkedAt || value.collectorMarkedAt >= value.residentMarkedAt,
    {
      message: "Collector confirmation cannot precede the resident timestamp.",
      path: ["collectorMarkedAt"],
    },
  );

export type CreateHandoverLogInput = z.infer<typeof createHandoverLogInputSchema>;

export const markKeptOutInputSchema = z.object({
  collectionEventId: uuidSchema,
  photoUrl: z.string().url().optional(),
});

export const confirmCollectedInputSchema = z.object({
  handoverLogId: uuidSchema,
});

export type MarkKeptOutInput = z.infer<typeof markKeptOutInputSchema>;
export type ConfirmCollectedInput = z.infer<typeof confirmCollectedInputSchema>;
