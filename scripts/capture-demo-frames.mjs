import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const origin = process.env.DEMO_ORIGIN ?? "https://vandi-eight.vercel.app";
const outDir = new URL("../.verification/demo-frames/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

async function shot(name) {
  await page.screenshot({ path: new URL(`${name}.png`, outDir).pathname, fullPage: false });
}

await page.goto(`${origin}/`, { waitUntil: "networkidle" });
await shot("01-landing");

await page.goto(`${origin}/sign-up`, { waitUntil: "networkidle" });
await shot("02-signup");

const otpResponse = await page.request.post(`${origin}/api/auth/request-otp`, {
  data: { phone: "+91-00000-00002" },
});
const otpBody = await otpResponse.json();
const verifyResponse = await page.request.post(`${origin}/api/auth/verify-otp`, {
  data: { phone: "+91-00000-00002", name: "Anjali Nair", otp: otpBody.devOtp },
});
const setCookie = verifyResponse.headers()["set-cookie"];
if (!setCookie) throw new Error("Could not restore Anjali's session.");
await context.addCookies([{
  name: "vandi_session",
  value: setCookie.split(";")[0].split("=").slice(1).join("="),
  url: origin,
}]);

await page.goto(`${origin}/home`, { waitUntil: "networkidle" });
await shot("03-today");

const sms = page.getByRole("button", { name: "SMS" });
if (await sms.count()) {
  await sms.click();
  await shot("04-sms-preview");
}
const whatsapp = page.getByRole("button", { name: "WhatsApp" });
if (await whatsapp.count()) {
  await whatsapp.click();
  await shot("05-whatsapp-preview");
}

await page.goto(`${origin}/history`, { waitUntil: "networkidle" });
await shot("06-history");

await page.goto(`${origin}/history?month=2026-08`, { waitUntil: "networkidle" });
await shot("07-history-august");

await page.goto(`${origin}/payments`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /August|Payments|Receipt/i }).first().waitFor();
await shot("08-payments");

await page.goto(`${origin}/payments/receipts/VN-RCP-202608-000006`, { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: "VN-RCP-202608-000006" }).waitFor({ timeout: 15_000 });
await shot("09-receipt");

await page.goto(`${origin}/coordinator`, { waitUntil: "networkidle" });
await shot("10-collector");

await browser.close();
process.stdout.write(`Captured demo frames in ${outDir.pathname}\n`);
