import { createCollectorAuthService } from "@/services/collector-auth.service";

describe("CollectorAuthService", () => {
  it("accepts only the fixed DEV collector code", () => {
    const service = createCollectorAuthService("654321");
    expect(service.verifyCode({ code: "654321" })).toEqual({ role: "collector" });
    expect(() => service.verifyCode({ code: "123456" })).toThrow("DEV collector code");
  });
});
