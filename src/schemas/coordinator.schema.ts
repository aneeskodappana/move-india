import { z } from "zod";

export const collectorLoginInputSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit DEV collector code."),
});

export type CollectorLoginInput = z.infer<typeof collectorLoginInputSchema>;
