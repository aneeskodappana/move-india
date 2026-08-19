import { parseOptionalJson, requestClientKey } from "@/lib/http";
import { payCurrentMonthInputSchema } from "@/schemas/payment.schema";

describe("HTTP helpers", () => {
  it("accepts an empty mock-payment body and rejects extra fields", async () => {
    const empty = new Request("http://127.0.0.1/api/payments/pay", { method: "POST" });
    await expect(parseOptionalJson(empty, payCurrentMonthInputSchema)).resolves.toEqual({});

    const extra = new Request("http://127.0.0.1/api/payments/pay", {
      method: "POST",
      body: JSON.stringify({ occupantId: "30000000-0000-4000-8000-000000000001" }),
    });
    await expect(parseOptionalJson(extra, payCurrentMonthInputSchema)).rejects.toMatchObject({
      code: "invalid_request",
      status: 400,
    });
  });

  it("uses the first forwarded address as the rate-limit key", () => {
    const request = new Request("http://127.0.0.1/api/auth/request-otp", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(requestClientKey(request)).toBe("203.0.113.10");
  });
});
