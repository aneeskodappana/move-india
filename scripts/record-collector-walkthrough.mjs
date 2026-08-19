import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const origin = process.env.DEMO_ORIGIN ?? "https://vandi-eight.vercel.app";
const outDir = new URL("../.verification/demo-record-collector/", import.meta.url);
mkdirSync(outDir, { recursive: true });

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unusedPhone() {
  const suffix = String((Date.now() + process.pid) % 100_000).padStart(5, "0");
  return `+91-00000-${suffix}`;
}

const setup = await chromium.launch({ headless: true });
const setupContext = await setup.newContext();
const setupPage = await setupContext.newPage();

const phone = unusedPhone();
const otpBody = await (await setupPage.request.post(`${origin}/api/auth/request-otp`, {
  data: { phone },
})).json();
if (!otpBody.devOtp) throw new Error("Could not request a setup OTP.");
const verify = await setupPage.request.post(`${origin}/api/auth/verify-otp`, {
  data: { phone, name: "Collector Demo Resident", otp: otpBody.devOtp },
});
const verifyCookie = verify.headers()["set-cookie"];
if (!verifyCookie) throw new Error("Setup sign-in did not issue a session.");
const cookieHeader = verifyCookie.split(";")[0];
const properties = await (await setupPage.request.get(`${origin}/api/properties`, {
  headers: { cookie: cookieHeader },
})).json();
const propertyId = properties.properties?.[0]?.id;
if (!propertyId) throw new Error("No property available for collector demo setup.");
const register = await setupPage.request.post(`${origin}/api/occupants/register`, {
  headers: { cookie: cookieHeader, "content-type": "application/json" },
  data: { propertyId, role: "tenant", moveInDate: "2026-08-01" },
});
const registerCookie = (register.headers()["set-cookie"] ?? verifyCookie).split(";")[0];
const today = await (await setupPage.request.get(`${origin}/api/today`, {
  headers: { cookie: registerCookie },
})).json();
if (!today.today?.collection?.id) throw new Error("Setup resident has no collection event today.");
const keptOut = await setupPage.request.post(`${origin}/api/handovers/kept-out`, {
  headers: { cookie: registerCookie, "content-type": "application/json" },
  data: { collectionEventId: today.today.collection.id },
});
if (!keptOut.ok()) throw new Error("Could not seed a kept-out handover for the collector queue.");
await setupContext.close();
await setup.close();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: outDir.pathname,
    size: { width: 1280, height: 720 },
  },
});

await context.addInitScript(() => {
  const cursor = document.createElement("div");
  cursor.id = "demo-cursor";
  cursor.style.cssText =
    "position:fixed;z-index:2147483647;width:18px;height:18px;border-radius:50%;border:2px solid #0c1e17;background:#f4ce72;pointer-events:none;transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(12,30,23,0.35);";
  const mount = () => {
    if (!document.getElementById("demo-cursor")) document.body.appendChild(cursor);
  };
  if (document.body) mount();
  else window.addEventListener("DOMContentLoaded", mount);
  document.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
});

const page = await context.newPage();

async function moveAndClick(locator) {
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error("Could not locate a click target.");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 14 });
  await pause(180);
  await locator.click();
}

await page.goto(`${origin}/`, { waitUntil: "domcontentloaded" });
await page.getByRole("heading", { name: /Know what is collected/i }).waitFor();
await pause(5000);
await moveAndClick(page.getByRole("link", { name: "Open collector demo" }));

await page.getByRole("heading", { name: "Collector confirmation" }).waitFor();
await page.getByText("DEV collector mode").waitFor();
await pause(5000);
const code = page.getByLabel("Six-digit collector code");
await moveAndClick(code);
await code.fill("");
await page.keyboard.type("654321", { delay: 160 });
await pause(800);
await moveAndClick(page.getByRole("button", { name: "Open collector queue" }));

await page.getByRole("heading", { name: "Pickup confirmations" }).waitFor();
await page.getByRole("button", { name: "Mark collected" }).first().waitFor({ timeout: 15_000 });
await pause(7000);
await moveAndClick(page.getByRole("button", { name: "Mark collected" }).first());
await page.getByText("Collection confirmed").waitFor();
await pause(7000);

await pause(2500);
const video = page.video();
await page.close();
await context.close();
await browser.close();
const saved = video ? await video.path() : "";
process.stdout.write(`${saved}\n`);
