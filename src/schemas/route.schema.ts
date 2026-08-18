import { z } from "zod";
import { uuidSchema } from "@/schemas/common";

export const materialScheduleSchema = z.object({
  materialType: z.string().trim().min(2).max(100),
  timeWindow: z.string().trim().min(5).max(80),
});

export const weeklyMaterialCalendarSchema = z
  .object({
    monday: materialScheduleSchema.optional(),
    tuesday: materialScheduleSchema.optional(),
    wednesday: materialScheduleSchema.optional(),
    thursday: materialScheduleSchema.optional(),
    friday: materialScheduleSchema.optional(),
    saturday: materialScheduleSchema.optional(),
    sunday: materialScheduleSchema.optional(),
  })
  .strict();

export const createRouteInputSchema = z.object({
  id: uuidSchema.optional(),
  ward: z.string().trim().min(2).max(100),
  name: z.string().trim().min(3).max(120),
  weeklyMaterialCalendar: weeklyMaterialCalendarSchema,
});

export type CreateRouteInput = z.infer<typeof createRouteInputSchema>;
