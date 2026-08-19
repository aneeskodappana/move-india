import { z } from "zod";
import { syntheticPhoneSchema } from "@/schemas/common";

export const requestOtpInputSchema = z.object({
  phone: syntheticPhoneSchema,
});

export const verifyOtpInputSchema = z.object({
  phone: syntheticPhoneSchema,
  name: z.string().trim().min(2).max(120),
  otp: z.string().regex(/^\d{6}$/, "Enter the six-digit DEV OTP."),
});

export type RequestOtpInput = z.infer<typeof requestOtpInputSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>;
