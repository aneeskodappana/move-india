import type { Occupant } from "@/db/schema";
import { createAuthService } from "@/services/auth.service";

const registeredOccupant: Occupant = {
  id: "30000000-0000-4000-8000-000000000001",
  propertyId: "20000000-0000-4000-8000-000000000001",
  name: "Anjali Nair",
  phone: "+91-00000-00001",
  role: "tenant",
  moveInDate: "2026-06-01",
  moveOutDate: null,
};

describe("AuthService", () => {
  it("rate-limits and returns the clearly mocked OTP", () => {
    const consume = vi.fn();
    const service = createAuthService({
      occupants: { findByPhone: vi.fn() },
      rateLimiter: { consume },
      devOtpCode: "123456",
    });
    expect(service.requestOtp({ phone: "+91-00000-12345" }, "client-1")).toEqual({ devOtp: "123456" });
    expect(consume).toHaveBeenCalledWith("request:client-1:+91-00000-12345");
  });

  it("creates a verified pre-registration identity for a new phone", async () => {
    const service = createAuthService({
      occupants: { findByPhone: vi.fn().mockResolvedValue(null) },
      rateLimiter: { consume: vi.fn() },
      devOtpCode: "123456",
    });
    await expect(service.verifyOtp({ phone: "+91-00000-12345", name: "Anjali Nair", otp: "123456" }, "client-1")).resolves.toEqual({
      state: "verified",
      phone: "+91-00000-12345",
      name: "Anjali Nair",
    });
  });

  it("restores a registered identity and rejects a wrong OTP", async () => {
    const service = createAuthService({
      occupants: { findByPhone: vi.fn().mockResolvedValue(registeredOccupant) },
      rateLimiter: { consume: vi.fn() },
      devOtpCode: "123456",
    });
    await expect(service.verifyOtp({ phone: registeredOccupant.phone, name: "Ignored", otp: "123456" }, "client-1")).resolves.toMatchObject({
      state: "registered",
      occupantId: registeredOccupant.id,
      propertyId: registeredOccupant.propertyId,
    });
    await expect(service.verifyOtp({ phone: registeredOccupant.phone, name: "Anjali", otp: "000000" }, "client-1")).rejects.toThrow("DEV OTP");
  });
});
