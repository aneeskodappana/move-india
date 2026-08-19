import { requestOtpInputSchema, verifyOtpInputSchema } from "@/schemas/auth.schema";
import { joinPropertyInputSchema } from "@/schemas/registration.schema";

describe("M2 API input schemas", () => {
  it("accepts only synthetic demo phones and the fixed-shape OTP input", () => {
    expect(requestOtpInputSchema.safeParse({ phone: "+91-00000-12345" }).success).toBe(true);
    expect(requestOtpInputSchema.safeParse({ phone: "+91-98765-43210" }).success).toBe(false);
    expect(verifyOtpInputSchema.safeParse({ phone: "+91-00000-12345", name: "Anjali Nair", otp: "123456" }).success).toBe(true);
  });

  it("validates the property, role, and move-in date mutation", () => {
    expect(joinPropertyInputSchema.safeParse({
      propertyId: "20000000-0000-4000-8000-000000000001",
      role: "tenant",
      moveInDate: "2026-08-01",
    }).success).toBe(true);
    expect(joinPropertyInputSchema.safeParse({ propertyId: "not-an-id", role: "visitor", moveInDate: "tomorrow" }).success).toBe(false);
  });
});
