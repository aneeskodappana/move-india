import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const origin = process.env.DEMO_ORIGIN ?? "https://vandi-eight.vercel.app";
const outDir = new URL("../.verification/demo-record/", import.meta.url);
mkdirSync(outDir, { recursive: true });

function pause(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
await page.getByRole("heading", { name: /Waste management done right/i }).waitFor();
await pause(3200);
await moveAndClick(page.getByRole("link", { name: "Sign in as a resident" }));

await page.getByRole("heading", { name: /Sign in as the person/i }).waitFor();
await pause(1600);
const phone = page.getByLabel("Mobile number");
await moveAndClick(phone);
await phone.press("End");
await page.keyboard.type("00002", { delay: 160 });
await pause(700);
await moveAndClick(page.getByRole("button", { name: "Send sign-in code" }));

await page.getByText("DEV MODE").waitFor();
await page.getByRole("button", { name: "Verify and continue" }).waitFor();
await pause(2000);
await moveAndClick(page.getByRole("button", { name: "Verify and continue" }));

await page.waitForURL("**/home");
await page.getByRole("heading", { name: "Food waste" }).waitFor();
await pause(5000);
await page.evaluate(() => window.scrollTo({ top: 460, behavior: "smooth" }));
await pause(1500);
await moveAndClick(page.getByRole("button", { name: "SMS" }));
await pause(1800);
await moveAndClick(page.getByRole("button", { name: "WhatsApp" }));
await pause(1800);

await moveAndClick(page.getByRole("link", { name: "History" }));
await page.getByRole("heading", { name: "Proof pack" }).waitFor();
await pause(4000);
await page.evaluate(() => window.scrollTo({ top: 380, behavior: "smooth" }));
await pause(2500);
const august = page.getByRole("link", { name: "August 2026" });
if (await august.count()) {
  await moveAndClick(august.first());
  await pause(2200);
}

await moveAndClick(page.getByRole("link", { name: "Payments" }));
await page.getByText("Receipt list").waitFor();
await pause(2500);
const receipt = page.getByRole("link", { name: /View receipt VN-RCP-202608-000006|VN-RCP-202608-000006/ });
if (await receipt.count()) {
  await moveAndClick(receipt.first());
  await page.getByRole("heading", { name: "VN-RCP-202608-000006" }).waitFor();
  await pause(4500);
}

await pause(1800);
const video = page.video();
await page.close();
await context.close();
await browser.close();
const saved = video ? await video.path() : "";
process.stdout.write(`${saved}\n`);
