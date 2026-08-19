import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const milestone = process.argv[2]?.toUpperCase();
const verificationDirectory = path.join(projectRoot, ".verification");

const suites = {
  M0: {
    requiredFiles: [
      "package.json",
      "tsconfig.json",
      "tailwind.config.ts",
      "drizzle.config.ts",
      "src/app/page.tsx",
      "src/db/client.ts",
      "tests/unit/components/foundation-dashboard.test.tsx",
      "tests/unit/db/client.test.ts",
    ],
    fileAssertions: [
      {
        file: "tsconfig.json",
        description: "TypeScript strict mode is enabled",
        verify: (content) => {
          const config = JSON.parse(content);
          return (
            config.compilerOptions?.strict === true &&
            config.compilerOptions?.noUncheckedIndexedAccess === true
          );
        },
      },
      {
        file: "package.json",
        description: "Foundation dependencies and quality scripts are configured",
        verify: (content) => {
          const manifest = JSON.parse(content);
          const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
          const requiredDependencies = [
            "next",
            "react",
            "drizzle-orm",
            "@neondatabase/serverless",
            "zod",
            "tailwindcss",
            "vitest",
          ];
          const requiredScripts = ["lint", "typecheck", "test", "build"];

          return (
            requiredDependencies.every((dependency) => dependency in dependencies) &&
            requiredScripts.every((script) => script in manifest.scripts)
          );
        },
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Unit and component tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      {
        label: "Production dependency audit",
        command: "npm",
        args: ["audit", "--omit=dev", "--audit-level=high"],
      },
    ],
    smokeTest: true,
  },
  M1: {
    requiredFiles: [
      "src/db/schema.ts",
      "src/db/seed.ts",
      "src/db/seed-data.ts",
      "src/db/verify-m1.ts",
      "src/db/migrations/0000_lucky_stick.sql",
      "src/repositories/route.repo.ts",
      "src/repositories/property.repo.ts",
      "src/repositories/occupant.repo.ts",
      "src/repositories/collection-event.repo.ts",
      "src/repositories/handover.repo.ts",
      "src/repositories/payment.repo.ts",
      "src/repositories/grievance.repo.ts",
      "src/schemas/route.schema.ts",
      "src/schemas/property.schema.ts",
      "src/schemas/occupant.schema.ts",
      "src/schemas/collection-event.schema.ts",
      "src/schemas/handover.schema.ts",
      "src/schemas/payment.schema.ts",
      "src/schemas/grievance.schema.ts",
    ],
    fileAssertions: [
      {
        file: "src/db/schema.ts",
        description: "All seven M1 entities are declared",
        verify: (content) =>
          [
            "routes",
            "properties",
            "occupants",
            "collectionEvents",
            "handoverLogs",
            "payments",
            "grievances",
          ].every((entity) => content.includes(`export const ${entity} = pgTable`)),
      },
      {
        file: "src/db/migrations/0000_lucky_stick.sql",
        description: "Generated migration creates all seven tables",
        verify: (content) =>
          [
            "routes",
            "properties",
            "occupants",
            "collection_events",
            "handover_logs",
            "payments",
            "grievances",
          ].every((table) => content.includes(`CREATE TABLE \"${table}\"`)),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Repository, schema, and seed tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Migration drift check", command: "npm", args: ["run", "db:generate"] },
      { label: "Live development database verification", command: "npm", args: ["run", "db:verify:m1"] },
      {
        label: "Production dependency audit",
        command: "npm",
        args: ["audit", "--omit=dev", "--audit-level=high"],
      },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
  },
  M2: {
    requiredFiles: [
      "src/lib/session.ts",
      "src/lib/rate-limit.ts",
      "src/schemas/auth.schema.ts",
      "src/schemas/registration.schema.ts",
      "src/services/auth.service.ts",
      "src/services/occupant.service.ts",
      "src/services/property.service.ts",
      "src/app/api/auth/request-otp/route.ts",
      "src/app/api/auth/verify-otp/route.ts",
      "src/app/api/occupants/register/route.ts",
      "src/app/api/properties/route.ts",
      "src/app/sign-up/page.tsx",
      "src/app/join-property/page.tsx",
      "tests/unit/services/auth.service.test.ts",
      "tests/unit/services/occupant.service.test.ts",
    ],
    fileAssertions: [
      {
        file: "src/lib/session-cookie.ts",
        description: "Session cookie has the required security attributes",
        verify: (content) =>
          content.includes("httpOnly: true") &&
          content.includes("secure: true") &&
          content.includes('sameSite: "lax"'),
      },
      {
        file: "src/components/auth/dev-mode-banner.tsx",
        description: "Mock OTP is unmistakably labeled DEV MODE",
        verify: (content) => content.includes("DEV MODE") && content.includes("No SMS will be sent"),
      },
      {
        file: "src/app/api/occupants/register/route.ts",
        description: "Registration route delegates authorization and business logic to services",
        verify: (content) =>
          content.includes("requireRequestSession") && content.includes("services.occupants.register"),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Auth, service, repository, and component tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Live development database regression verification", command: "npm", args: ["run", "db:verify:m1"] },
      {
        label: "Production dependency audit",
        command: "npm",
        args: ["audit", "--omit=dev", "--audit-level=high"],
      },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
    authRegistrationSmokeTest: true,
  },
  M3: {
    requiredFiles: [
      "src/lib/india-date.ts",
      "src/services/broadcast.service.ts",
      "src/services/today.service.ts",
      "src/app/api/today/route.ts",
      "src/app/home/page.tsx",
      "src/components/resident/today-dashboard.tsx",
      "src/components/broadcast/broadcast-simulator.tsx",
      "tests/unit/services/broadcast.service.test.ts",
      "tests/unit/services/today.service.test.ts",
      "tests/unit/components/today-dashboard.test.tsx",
    ],
    fileAssertions: [
      {
        file: "src/components/broadcast/broadcast-simulator.tsx",
        description: "Broadcast simulator exposes app, SMS, and WhatsApp channels",
        verify: (content) =>
          content.includes('app: "App push"') &&
          content.includes('sms: "SMS"') &&
          content.includes('whatsapp: "WhatsApp"'),
      },
      {
        file: "src/app/api/today/route.ts",
        description: "Today API authorizes the resident and delegates to the service layer",
        verify: (content) =>
          content.includes("requireRequestSession") && content.includes("services.today.getForResident"),
      },
      {
        file: "src/services/today.service.ts",
        description: "Today service resolves property, route, and collection-event repositories",
        verify: (content) =>
          content.includes("properties.findById") &&
          content.includes("routes.findById") &&
          content.includes("collectionEvents.findByPropertyAndDate"),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Today, broadcast, repository, and regression tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Live development database regression verification", command: "npm", args: ["run", "db:verify:m1"] },
      {
        label: "Production dependency audit",
        command: "npm",
        args: ["audit", "--omit=dev", "--audit-level=high"],
      },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
    todayBroadcastSmokeTest: true,
  },
  M4: {
    requiredFiles: [
      "src/lib/collector-session.ts",
      "src/services/handover.service.ts",
      "src/services/collector-auth.service.ts",
      "src/app/api/handovers/kept-out/route.ts",
      "src/app/api/handovers/collected/route.ts",
      "src/app/api/coordinator/session/route.ts",
      "src/app/home/handover-controller.tsx",
      "src/app/coordinator/page.tsx",
      "src/components/handover/resident-handover-card.tsx",
      "src/components/coordinator/collector-queue.tsx",
      "tests/unit/services/handover.service.test.ts",
      "tests/unit/lib/collector-session.test.ts",
      "tests/unit/components/handover-components.test.tsx",
    ],
    fileAssertions: [
      {
        file: "tests/unit/services/handover.service.test.ts",
        description: "Critical cross-property authorization denial is covered",
        verify: (content) =>
          content.includes("blocks Anjali from marking Ravi's or any other property") &&
          content.includes('code: "forbidden"') &&
          content.includes("create).not.toHaveBeenCalled"),
      },
      {
        file: "src/services/handover.service.ts",
        description: "Resident ownership is checked before handover mutation",
        verify: (content) =>
          content.includes("event.propertyId !== resident.propertyId") &&
          content.indexOf("event.propertyId !== resident.propertyId") < content.indexOf("handovers.create"),
      },
      {
        file: "src/app/api/handovers/collected/route.ts",
        description: "Collector mutation requires its distinct signed actor",
        verify: (content) =>
          content.includes("requireRequestCollector") &&
          content.includes("services.handovers.confirmCollected"),
      },
      {
        file: "src/components/coordinator/collector-queue.tsx",
        description: "Collector screen is unmistakably marked as a DEV simulation",
        verify: (content) => content.includes("DEV collector mode") && content.includes("Mark collected"),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Handover authorization, service, repository, and regression tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Live development database regression verification", command: "npm", args: ["run", "db:verify:m1"] },
      { label: "Production dependency audit", command: "npm", args: ["audit", "--omit=dev", "--audit-level=high"] },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
    handoverSmokeTest: true,
  },
  M5: {
    requiredFiles: [
      "src/services/payment.service.ts",
      "src/services/history.service.ts",
      "src/schemas/history.schema.ts",
      "src/app/api/payments/route.ts",
      "src/app/api/payments/pay/route.ts",
      "src/app/api/payments/receipts/[receiptId]/route.ts",
      "src/app/api/history/route.ts",
      "src/app/history/page.tsx",
      "src/app/payments/page.tsx",
      "src/app/payments/receipts/[receiptId]/page.tsx",
      "src/components/resident/history-proof-pack.tsx",
      "src/components/resident/payment-ledger.tsx",
      "src/components/resident/payment-receipt.tsx",
      "tests/unit/services/payment.service.test.ts",
      "tests/unit/services/history.service.test.ts",
      "tests/unit/components/history-proof-pack.test.tsx",
      "tests/unit/components/payment-components.test.tsx",
    ],
    fileAssertions: [
      {
        file: "tests/unit/services/payment.service.test.ts",
        description: "Critical cross-occupant receipt denial is covered",
        verify: (content) =>
          content.includes("blocks Anjali from viewing Ravi's receipt") &&
          content.includes('code: "forbidden"') &&
          content.includes("findById).not.toHaveBeenCalled"),
      },
      {
        file: "src/services/payment.service.ts",
        description: "Receipt ownership is checked before the receipt is returned",
        verify: (content) =>
          content.includes("payment.occupantId !== resident.occupantId") &&
          content.indexOf("payment.occupantId !== resident.occupantId") < content.indexOf("serializePayment(payment)"),
      },
      {
        file: "src/app/api/payments/pay/route.ts",
        description: "Mock payment route authorizes the resident and delegates to the service layer",
        verify: (content) =>
          content.includes("requireRequestSession") && content.includes("services.payments.payCurrentMonth"),
      },
      {
        file: "src/components/resident/payment-ledger.tsx",
        description: "Payments screen is unmistakably labeled as mock UPI",
        verify: (content) => content.includes("mock UPI") && content.includes("Pay ₹"),
      },
      {
        file: "src/components/resident/history-proof-pack.tsx",
        description: "History proof pack combines handover timestamps and receipts",
        verify: (content) =>
          content.includes("Proof pack") &&
          content.includes("Collector confirmation missing") &&
          content.includes("Receipt "),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Payment, history, repository, and regression tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Live development database regression verification", command: "npm", args: ["run", "db:verify:m1"] },
      { label: "Production dependency audit", command: "npm", args: ["audit", "--omit=dev", "--audit-level=high"] },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
    paymentHistorySmokeTest: true,
  },
  M6: {
    requiredFiles: [
      "docs/security-checklist.md",
      "docs/mobile-check.md",
      ".env.example",
      "src/lib/session-cookie.ts",
      "src/lib/rate-limit.ts",
      "src/lib/auth-config.ts",
      "src/lib/http.ts",
      "src/app/api/payments/pay/route.ts",
      "src/components/resident/resident-nav.tsx",
      "src/app/home/loading.tsx",
      "src/app/history/loading.tsx",
      "src/app/payments/loading.tsx",
      "next.config.ts",
      "tests/unit/lib/http.test.ts",
      "tests/unit/lib/auth-config.test.ts",
      "tests/unit/services/collector-auth.service.test.ts",
    ],
    fileAssertions: [
      {
        file: "src/lib/session-cookie.ts",
        description: "Session cookie has the required security attributes",
        verify: (content) =>
          content.includes("httpOnly: true") &&
          content.includes("secure: true") &&
          content.includes('sameSite: "lax"'),
      },
      {
        file: "src/app/api/payments/pay/route.ts",
        description: "Mock payment route validates input before the service mutation",
        verify: (content) =>
          content.includes("parseOptionalJson") &&
          content.includes("payCurrentMonthInputSchema") &&
          content.indexOf("parseOptionalJson") < content.indexOf("payCurrentMonth"),
      },
      {
        file: "src/services/collector-auth.service.ts",
        description: "Collector login consumes the rate-limit stub",
        verify: (content) => content.includes("rateLimiter.consume") && content.includes("collector:"),
      },
      {
        file: "src/lib/auth-config.ts",
        description: "Deployed environments reject the example session secret",
        verify: (content) =>
          content.includes("EXAMPLE_SESSION_SECRET") && content.includes("must not use the example value"),
      },
      {
        file: "next.config.ts",
        description: "Security headers are configured for every path",
        verify: (content) =>
          content.includes("X-Content-Type-Options") &&
          content.includes("X-Frame-Options") &&
          content.includes("Referrer-Policy") &&
          content.includes("Permissions-Policy"),
      },
      {
        file: "src/components/resident/resident-nav.tsx",
        description: "Resident nav is a three-column wrap-safe control row",
        verify: (content) => content.includes("grid-cols-3") && content.includes("min-h-12"),
      },
      {
        file: "docs/security-checklist.md",
        description: "The §8.5 checklist is recorded as complete",
        verify: (content) =>
          content.includes("Every API route validates input") &&
          content.includes("Rate-limit stub on OTP/login") &&
          content.includes("| Done |"),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Security, polish, and regression tests", command: "npm", args: ["run", "test"] },
      { label: "Production build", command: "npm", args: ["run", "build"] },
      { label: "Live development database regression verification", command: "npm", args: ["run", "db:verify:m1"] },
      { label: "Production dependency audit", command: "npm", args: ["audit", "--omit=dev", "--audit-level=high"] },
    ],
    migrationDirectoryMustBeClean: true,
    smokeTest: false,
    securityPolishSmokeTest: true,
  },
  M7: {
    requiredFiles: [
      "docs/submission-write-up.md",
      "docs/demo-script.md",
      "docs/vandi-demo.mp4",
      "docs/vandi-collector-demo.mp4",
      "vandi-idea-doc.docx",
    ],
    fileAssertions: [
      {
        file: "docs/submission-write-up.md",
        description: "Write-up discloses mocked OTP, channels, UPI, and no government connection",
        verify: (content) =>
          content.includes("DEV MODE") &&
          content.includes("No money moves") &&
          content.includes("Haritha Mithram") &&
          content.includes("https://vandi-eight.vercel.app"),
      },
      {
        file: "docs/demo-script.md",
        description: "Demo script is a one-minute product walkthrough",
        verify: (content) =>
          content.includes("Sign in as a resident") &&
          content.includes("Proof pack") &&
          content.includes("Payments") &&
          content.includes("vandi-eight.vercel.app"),
      },
    ],
    commands: [
      { label: "Lint", command: "npm", args: ["run", "lint"] },
      { label: "Strict type check", command: "npm", args: ["run", "typecheck"] },
      { label: "Regression tests", command: "npm", args: ["run", "test"] },
      { label: "Production dependency audit", command: "npm", args: ["audit", "--omit=dev", "--audit-level=high"] },
    ],
    videoDurationMinSeconds: 35,
    videoDurationMaxSeconds: 70,
    smokeTest: false,
  },
};

function record(checks, label, status, detail) {
  checks.push({ label, status, detail });
  const symbol = status === "passed" ? "✓" : "✗";
  process.stdout.write(`${symbol} ${label}${detail ? ` — ${detail}` : ""}\n`);
}

function runCommand(checks, check) {
  process.stdout.write(`\n[verify] ${check.label}\n`);
  const result = spawnSync(check.command, check.args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    record(checks, check.label, "failed", `exit code ${result.status ?? "unknown"}`);
    throw new Error(`${check.label} failed.`);
  }

  record(checks, check.label, "passed", "exit code 0");
}

async function runProductionSmokeTest(checks) {
  const port = 3199;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let response;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        response = await fetch(`http://127.0.0.1:${port}/`);
        if (response.ok) break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (!response?.ok) {
      throw new Error(`Production server did not return HTTP 200. ${serverOutput.join("")}`);
    }

    const html = await response.text();
    if (!html.includes("Today’s pickup, recorded in your name") || !html.includes("Not a government service")) {
      throw new Error("Production HTML is missing the expected landing content.");
    }

    record(checks, "Production HTTP smoke test", "passed", "HTTP 200 with expected content");
  } finally {
    server.kill("SIGTERM");
  }
}

async function runAuthRegistrationSmokeTest(checks) {
  const port = 3198;
  const origin = `http://127.0.0.1:${port}`;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${origin}/sign-up`, { redirect: "manual" });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!ready) throw new Error(`M2 production server did not become ready. ${serverOutput.join("")}`);

    let verifiedCookie;
    let verifiedPhone;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = String((Date.now() + process.pid + attempt) % 100_000).padStart(5, "0");
      const phone = `+91-00000-${suffix}`;
      const otpResponse = await fetch(`${origin}/api/auth/request-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const otpBody = await otpResponse.json();
      if (!otpResponse.ok || otpBody.mode !== "DEV MODE" || !otpBody.devOtp) {
        throw new Error("DEV OTP request did not return the explicitly mocked code.");
      }

      const verifyResponse = await fetch(`${origin}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, name: "Milestone Verifier", otp: otpBody.devOtp }),
      });
      const verifyBody = await verifyResponse.json();
      const setCookie = verifyResponse.headers.get("set-cookie") ?? "";
      if (!verifyResponse.ok || !setCookie) throw new Error("OTP verification did not issue a session cookie.");
      if (verifyBody.next === "/join-property") {
        verifiedCookie = setCookie.split(";")[0];
        verifiedPhone = phone;
        if (!/HttpOnly/i.test(setCookie) || !/Secure/i.test(setCookie) || !/SameSite=Lax/i.test(setCookie)) {
          throw new Error("Issued session cookie is missing a required security attribute.");
        }
        break;
      }
    }
    if (!verifiedCookie || !verifiedPhone) throw new Error("Could not allocate an unused synthetic verifier phone.");

    const propertiesResponse = await fetch(`${origin}/api/properties`, {
      headers: { cookie: verifiedCookie },
    });
    const propertiesBody = await propertiesResponse.json();
    const propertyOptions = Array.isArray(propertiesBody.properties) ? propertiesBody.properties : [];
    const property = [...propertyOptions].sort(
      (left, right) => (right.occupants?.length ?? 0) - (left.occupants?.length ?? 0),
    )[0];
    if (!propertiesResponse.ok || !property?.id) {
      throw new Error("Authenticated property discovery did not return a join option.");
    }

    const registerResponse = await fetch(`${origin}/api/occupants/register`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: verifiedCookie },
      body: JSON.stringify({ propertyId: property.id, role: "tenant", moveInDate: "2026-08-01" }),
    });
    const registerBody = await registerResponse.json();
    const registeredSetCookie = registerResponse.headers.get("set-cookie") ?? "";
    const registeredCookie = registeredSetCookie.split(";")[0];
    if (registerResponse.status !== 201 || registerBody.occupant?.phone !== verifiedPhone || !registeredCookie) {
      throw new Error("Verified occupant registration did not complete against the live database.");
    }

    const sessionResponse = await fetch(`${origin}/api/session`, {
      headers: { cookie: registeredCookie },
    });
    const sessionBody = await sessionResponse.json();
    if (!sessionResponse.ok || sessionBody.session?.state !== "registered") {
      throw new Error("The post-registration session was not upgraded to registered.");
    }
    const homeResponse = await fetch(`${origin}/home`, { headers: { cookie: registeredCookie } });
    const homeHtml = await homeResponse.text();
    if (
      !homeResponse.ok ||
      (!homeHtml.includes("Put out today") && !homeHtml.includes("No collection scheduled"))
    ) {
      throw new Error("Registered resident home did not render the completed state.");
    }

    record(
      checks,
      "Live auth and registration HTTP journey",
      "passed",
      "DEV OTP → signed cookie → property discovery → occupant insert → registered home",
    );
  } finally {
    server.kill("SIGTERM");
  }
}

async function runTodayBroadcastSmokeTest(checks) {
  const port = 3197;
  const origin = `http://127.0.0.1:${port}`;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${origin}/sign-up`, { redirect: "manual" });
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!ready) throw new Error(`M3 production server did not become ready. ${serverOutput.join("")}`);

    const phone = "+91-00000-00002";
    const otpResponse = await fetch(`${origin}/api/auth/request-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const otpBody = await otpResponse.json();
    if (!otpResponse.ok || otpBody.mode !== "DEV MODE" || !otpBody.devOtp) {
      throw new Error("Seeded resident DEV OTP request failed.");
    }

    const verifyResponse = await fetch(`${origin}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, name: "Anjali Nair", otp: otpBody.devOtp }),
    });
    const verifyBody = await verifyResponse.json();
    const cookie = (verifyResponse.headers.get("set-cookie") ?? "").split(";")[0];
    if (!verifyResponse.ok || verifyBody.next !== "/home" || !cookie) {
      throw new Error("Seeded resident sign-in did not restore a registered session.");
    }

    const todayResponse = await fetch(`${origin}/api/today`, { headers: { cookie } });
    const todayBody = await todayResponse.json();
    const today = todayBody.today;
    if (
      !todayResponse.ok ||
      today?.resident?.name !== "Anjali Nair" ||
      today?.collection?.materialType !== "Food waste" ||
      today?.collection?.timeWindow !== "7:00–8:30 AM" ||
      today?.route?.name !== "Elamkulam North" ||
      !today?.message?.includes("Food waste")
    ) {
      throw new Error("Today API did not resolve the seeded route and collection window.");
    }

    const homeResponse = await fetch(`${origin}/home`, { headers: { cookie } });
    const homeHtml = await homeResponse.text();
    const expectedContent = [
      "Put out today",
      "Food waste",
      "7:00–8:30 AM",
      "App push",
      "SMS",
      "WhatsApp",
      "channel delivery is simulated",
    ];
    if (!homeResponse.ok || !expectedContent.every((content) => homeHtml.includes(content))) {
      throw new Error("Resident home HTML is missing schedule or channel-preview content.");
    }

    record(
      checks,
      "Live resident Today and broadcast HTTP journey",
      "passed",
      "seeded session → property + route + event → canonical message → 3 channel controls",
    );
  } finally {
    server.kill("SIGTERM");
  }
}

async function runHandoverSmokeTest(checks) {
  const port = 3196;
  const origin = `http://127.0.0.1:${port}`;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    { cwd: projectRoot, env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${origin}/sign-up`, { redirect: "manual" });
        if (response.ok) { ready = true; break; }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!ready) throw new Error(`M4 production server did not become ready. ${serverOutput.join("")}`);

    const anjaliOtp = await fetch(`${origin}/api/auth/request-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "+91-00000-00002" }),
    }).then((response) => response.json());
    const anjaliResponse = await fetch(`${origin}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "+91-00000-00002", name: "Anjali Nair", otp: anjaliOtp.devOtp }),
    });
    const anjaliCookie = (anjaliResponse.headers.get("set-cookie") ?? "").split(";")[0];
    const anjaliToday = await fetch(`${origin}/api/today`, { headers: { cookie: anjaliCookie } }).then((response) => response.json());
    if (!anjaliToday.today?.collection?.id || !anjaliToday.today?.property?.id) {
      throw new Error("Could not resolve the seeded cross-property authorization fixture.");
    }

    let verifiedCookie;
    let verifiedPhone;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = String((Date.now() + process.pid + attempt) % 100_000).padStart(5, "0");
      const phone = `+91-00000-${suffix}`;
      const otpResponse = await fetch(`${origin}/api/auth/request-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const otpBody = await otpResponse.json();
      const verifyResponse = await fetch(`${origin}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, name: "M4 Journey Verifier", otp: otpBody.devOtp }),
      });
      const verifyBody = await verifyResponse.json();
      if (verifyBody.next === "/join-property") {
        verifiedCookie = (verifyResponse.headers.get("set-cookie") ?? "").split(";")[0];
        verifiedPhone = phone;
        break;
      }
    }
    if (!verifiedCookie || !verifiedPhone) throw new Error("Could not allocate an unused synthetic M4 phone.");

    const propertiesResponse = await fetch(`${origin}/api/properties`, { headers: { cookie: verifiedCookie } });
    const propertiesBody = await propertiesResponse.json();
    const property = propertiesBody.properties?.find((candidate) => candidate.id !== anjaliToday.today.property.id);
    if (!property?.id) throw new Error("Could not find a second synthetic property for M4 authorization verification.");

    const registerResponse = await fetch(`${origin}/api/occupants/register`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: verifiedCookie },
      body: JSON.stringify({ propertyId: property.id, role: "tenant", moveInDate: "2026-08-01" }),
    });
    const registeredCookie = (registerResponse.headers.get("set-cookie") ?? "").split(";")[0];
    if (registerResponse.status !== 201 || !registeredCookie) throw new Error("M4 synthetic resident registration failed.");

    const todayResponse = await fetch(`${origin}/api/today`, { headers: { cookie: registeredCookie } });
    const todayBody = await todayResponse.json();
    if (!todayResponse.ok || !todayBody.today?.collection?.id) throw new Error("M4 resident has no live collection event.");

    const forbiddenResponse = await fetch(`${origin}/api/handovers/kept-out`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: registeredCookie },
      body: JSON.stringify({ collectionEventId: anjaliToday.today.collection.id }),
    });
    const forbiddenBody = await forbiddenResponse.json();
    if (forbiddenResponse.status !== 403 || forbiddenBody.error?.code !== "forbidden") {
      throw new Error("Cross-property resident handover mutation was not denied.");
    }

    const keptOutResponse = await fetch(`${origin}/api/handovers/kept-out`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: registeredCookie },
      body: JSON.stringify({ collectionEventId: todayBody.today.collection.id }),
    });
    const keptOutBody = await keptOutResponse.json();
    if (!keptOutResponse.ok || keptOutBody.handover?.status !== "kept_out" || !keptOutBody.handover?.residentMarkedAt) {
      throw new Error("Resident kept-out timestamp was not persisted.");
    }

    const collectorResponse = await fetch(`${origin}/api/coordinator/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: process.env.DEV_COLLECTOR_CODE ?? "654321" }),
    });
    const collectorSetCookie = collectorResponse.headers.get("set-cookie") ?? "";
    const collectorCookie = collectorSetCookie.split(";")[0];
    if (!collectorResponse.ok || !collectorCookie || !/HttpOnly/i.test(collectorSetCookie)) {
      throw new Error("Distinct signed collector session was not issued securely.");
    }

    const queueResponse = await fetch(`${origin}/coordinator`, { headers: { cookie: collectorCookie } });
    const queueHtml = await queueResponse.text();
    if (!queueResponse.ok || !queueHtml.includes(property.addressLine) || !queueHtml.includes("DEV collector mode")) {
      throw new Error("Collector queue did not render the resident-marked handover.");
    }

    const collectedResponse = await fetch(`${origin}/api/handovers/collected`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: collectorCookie },
      body: JSON.stringify({ handoverLogId: keptOutBody.handover.id }),
    });
    const collectedBody = await collectedResponse.json();
    if (!collectedResponse.ok || collectedBody.handover?.status !== "collected" || !collectedBody.handover?.collectorMarkedAt) {
      throw new Error("Collector timestamp was not persisted independently.");
    }

    const completedTodayResponse = await fetch(`${origin}/api/today`, { headers: { cookie: registeredCookie } });
    const completedToday = await completedTodayResponse.json();
    if (
      completedToday.today?.handover?.status !== "collected" ||
      !completedToday.today?.handover?.residentMarkedAt ||
      !completedToday.today?.handover?.collectorMarkedAt
    ) {
      throw new Error("Resident Today did not return the completed two-sided proof record.");
    }

    const homeResponse = await fetch(`${origin}/home`, { headers: { cookie: registeredCookie } });
    const homeHtml = await homeResponse.text();
    if (!homeResponse.ok || !homeHtml.includes("Proof record complete")) {
      throw new Error("Resident home did not render the completed two-sided proof record.");
    }

    record(
      checks,
      "Live two-sided handover HTTP journey",
      "passed",
      "cross-property denial → resident timestamp → separate collector session + timestamp → completed proof",
    );
  } finally {
    server.kill("SIGTERM");
  }
}

async function runPaymentHistorySmokeTest(checks) {
  const port = 3195;
  const origin = `http://127.0.0.1:${port}`;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    { cwd: projectRoot, env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const response = await fetch(`${origin}/sign-up`, { redirect: "manual" });
        if (response.ok) { ready = true; break; }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!ready) throw new Error(`M5 production server did not become ready. ${serverOutput.join("")}`);

    const anjaliOtp = await fetch(`${origin}/api/auth/request-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "+91-00000-00002" }),
    }).then((response) => response.json());
    const anjaliResponse = await fetch(`${origin}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "+91-00000-00002", name: "Anjali Nair", otp: anjaliOtp.devOtp }),
    });
    const anjaliCookie = (anjaliResponse.headers.get("set-cookie") ?? "").split(";")[0];
    if (!anjaliResponse.ok || !anjaliCookie) throw new Error("Seeded Anjali session was not restored.");

    const historyResponse = await fetch(`${origin}/api/history?month=2026-08`, { headers: { cookie: anjaliCookie } });
    const historyBody = await historyResponse.json();
    const gap = historyBody.history?.collections?.find((entry) => entry.eventDate === "2026-08-13");
    const paidReceipt = historyBody.history?.payments?.find((payment) => payment.status === "paid");
    if (
      !historyResponse.ok ||
      historyBody.history?.resident?.name !== "Anjali Nair" ||
      !gap?.materialType ||
      gap?.handover?.status !== "kept_out" ||
      gap?.handover?.collectorMarkedAt !== null ||
      !paidReceipt?.receiptId
    ) {
      throw new Error("Anjali proof pack did not include the missing-collector gap and a paid receipt.");
    }

    const historyPage = await fetch(`${origin}/history`, { headers: { cookie: anjaliCookie } });
    const historyHtml = await historyPage.text();
    const expectedHistory = ["Proof pack", "Food waste", "Collector confirmation missing", "Print proof pack", paidReceipt.receiptId];
    if (!historyPage.ok || !expectedHistory.every((content) => historyHtml.includes(content))) {
      throw new Error("History HTML is missing proof-pack content.");
    }

    let verifiedCookie;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const suffix = String((Date.now() + process.pid + attempt) % 100_000).padStart(5, "0");
      const phone = `+91-00000-${suffix}`;
      const otpBody = await fetch(`${origin}/api/auth/request-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      }).then((response) => response.json());
      const verifyResponse = await fetch(`${origin}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, name: "M5 Journey Verifier", otp: otpBody.devOtp }),
      });
      const verifyBody = await verifyResponse.json();
      if (verifyBody.next === "/join-property") {
        verifiedCookie = (verifyResponse.headers.get("set-cookie") ?? "").split(";")[0];
        break;
      }
    }
    if (!verifiedCookie) throw new Error("Could not allocate an unused synthetic M5 phone.");

    const propertiesBody = await fetch(`${origin}/api/properties`, { headers: { cookie: verifiedCookie } }).then((response) => response.json());
    const property = propertiesBody.properties?.[0];
    if (!property?.id) throw new Error("Could not find a synthetic property for M5 payment verification.");

    const registerResponse = await fetch(`${origin}/api/occupants/register`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: verifiedCookie },
      body: JSON.stringify({ propertyId: property.id, role: "tenant", moveInDate: "2026-08-01" }),
    });
    const registeredCookie = (registerResponse.headers.get("set-cookie") ?? "").split(";")[0];
    if (registerResponse.status !== 201 || !registeredCookie) throw new Error("M5 synthetic resident registration failed.");

    const ledgerResponse = await fetch(`${origin}/api/payments`, { headers: { cookie: registeredCookie } });
    const ledgerBody = await ledgerResponse.json();
    if (!ledgerResponse.ok || ledgerBody.ledger?.current?.status !== "pending" || ledgerBody.ledger?.current?.amountInr !== 80) {
      throw new Error("Current-month payment ledger was not created as a pending ₹80 fee.");
    }

    const payResponse = await fetch(`${origin}/api/payments/pay`, { method: "POST", headers: { cookie: registeredCookie } });
    const payBody = await payResponse.json();
    if (!payResponse.ok || payBody.payment?.status !== "paid" || !payBody.payment?.paidAt || !payBody.payment?.receiptId) {
      throw new Error("Mock UPI payment did not persist a paid receipt.");
    }

    const ownReceipt = await fetch(`${origin}/api/payments/receipts/${payBody.payment.receiptId}`, {
      headers: { cookie: registeredCookie },
    });
    const ownReceiptBody = await ownReceipt.json();
    if (!ownReceipt.ok || ownReceiptBody.receipt?.payment?.receiptId !== payBody.payment.receiptId) {
      throw new Error("Paid resident could not load their own digital receipt.");
    }

    const forbiddenReceipt = await fetch(`${origin}/api/payments/receipts/${paidReceipt.receiptId}`, {
      headers: { cookie: registeredCookie },
    });
    const forbiddenBody = await forbiddenReceipt.json();
    if (forbiddenReceipt.status !== 403 || forbiddenBody.error?.code !== "forbidden") {
      throw new Error("Cross-occupant receipt access was not denied.");
    }

    const paymentsPage = await fetch(`${origin}/payments`, { headers: { cookie: registeredCookie } });
    const paymentsHtml = await paymentsPage.text();
    if (!paymentsPage.ok || !paymentsHtml.includes(payBody.payment.receiptId) || !paymentsHtml.includes("mock UPI")) {
      throw new Error("Payments HTML did not render the mock receipt and disclosure.");
    }

    record(
      checks,
      "Live payment ledger and history HTTP journey",
      "passed",
      "Anjali proof pack + gap → new resident mock UPI → receipt → cross-occupant denial",
    );
  } finally {
    server.kill("SIGTERM");
  }
}

async function runSecurityPolishSmokeTest(checks) {
  const port = 3194;
  const origin = `http://127.0.0.1:${port}`;
  const serverOutput = [];
  const server = spawn(
    process.execPath,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p", String(port)],
    { cwd: projectRoot, env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (chunk) => serverOutput.push(chunk.toString()));
  server.stderr.on("data", (chunk) => serverOutput.push(chunk.toString()));

  try {
    let landing;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        landing = await fetch(`${origin}/`);
        if (landing.ok) break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    if (!landing?.ok) throw new Error(`M6 production server did not become ready. ${serverOutput.join("")}`);

    const landingHtml = await landing.text();
    if (!landingHtml.includes("Today’s pickup, recorded in your name") || !landingHtml.includes("Not a government service")) {
      throw new Error("Landing page is missing the expected service content.");
    }
    const requiredHeaders = ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"];
    const missingHeader = requiredHeaders.find((header) => !landing.headers.get(header));
    if (missingHeader) throw new Error(`Missing security header: ${missingHeader}.`);

    const unauthenticated = await fetch(`${origin}/api/payments/pay`, { method: "POST" });
    const unauthenticatedBody = await unauthenticated.json();
    if (unauthenticated.status !== 401 || unauthenticatedBody.error?.code !== "unauthorized") {
      throw new Error("Unauthenticated payment mutation was not denied.");
    }

    const phone = "+91-00000-31940";
    let limited;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      limited = await fetch(`${origin}/api/auth/request-otp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
    }
    const limitedBody = await limited.json();
    if (limited.status !== 429 || limitedBody.error?.code !== "rate_limited") {
      throw new Error("OTP rate-limit stub did not return 429 after repeated requests.");
    }

    record(
      checks,
      "Live security and polish HTTP journey",
      "passed",
      "landing disclosure + security headers + unauthenticated denial + OTP 429",
    );
  } finally {
    server.kill("SIGTERM");
  }
}

async function main() {
  if (!milestone || !(milestone in suites)) {
    const available = Object.keys(suites).join(", ");
    process.stderr.write(`Usage: npm run verify:milestone -- <milestone>\nAvailable: ${available}\n`);
    process.exitCode = 2;
    return;
  }

  process.chdir(projectRoot);
  mkdirSync(verificationDirectory, { recursive: true });

  const startedAt = new Date().toISOString();
  const checks = [];
  const suite = suites[milestone];
  let status = "passed";
  let errorMessage;

  process.stdout.write(`\nVandi milestone verifier — ${milestone}\n`);

  try {
    for (const file of suite.requiredFiles) {
      if (!existsSync(path.join(projectRoot, file))) {
        record(checks, `Required file: ${file}`, "failed", "missing");
        throw new Error(`Required file is missing: ${file}`);
      }
      record(checks, `Required file: ${file}`, "passed", "present");
    }

    for (const assertion of suite.fileAssertions) {
      const content = readFileSync(path.join(projectRoot, assertion.file), "utf8");
      if (!assertion.verify(content)) {
        record(checks, assertion.description, "failed", assertion.file);
        throw new Error(`${assertion.description} failed.`);
      }
      record(checks, assertion.description, "passed", assertion.file);
    }

    for (const command of suite.commands) {
      runCommand(checks, command);
    }

    if (suite.migrationDirectoryMustBeClean) {
      const migrationStatus = spawnSync(
        "git",
        ["status", "--porcelain", "--", "src/db/migrations"],
        { cwd: projectRoot, encoding: "utf8" },
      ).stdout.trim();
      if (migrationStatus) {
        record(checks, "Migration files match the committed schema", "failed", migrationStatus);
        throw new Error("Migration drift was detected.");
      }
      record(checks, "Migration files match the committed schema", "passed", "no drift");
    }

    if (suite.smokeTest) {
      await runProductionSmokeTest(checks);
    }
    if (suite.authRegistrationSmokeTest) {
      await runAuthRegistrationSmokeTest(checks);
    }
    if (suite.todayBroadcastSmokeTest) {
      await runTodayBroadcastSmokeTest(checks);
    }
    if (suite.handoverSmokeTest) {
      await runHandoverSmokeTest(checks);
    }
    if (suite.paymentHistorySmokeTest) {
      await runPaymentHistorySmokeTest(checks);
    }
    if (suite.securityPolishSmokeTest) {
      await runSecurityPolishSmokeTest(checks);
    }
    if (suite.videoDurationMaxSeconds) {
      const probe = spawnSync(
        "ffprobe",
        ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", "docs/vandi-demo.mp4"],
        { cwd: projectRoot, encoding: "utf8" },
      );
      const duration = Number.parseFloat(probe.stdout.trim());
      const tooShort = suite.videoDurationMinSeconds && duration < suite.videoDurationMinSeconds;
      if (!Number.isFinite(duration) || duration <= 0 || duration > suite.videoDurationMaxSeconds || tooShort) {
        record(checks, "Demo video is a one-minute walkthrough", "failed", probe.stdout.trim() || probe.stderr.trim());
        throw new Error("Demo video duration is missing or outside the one-minute walkthrough window.");
      }
      record(checks, "Demo video is a one-minute walkthrough", "passed", `${duration.toFixed(1)}s`);
    }
  } catch (error) {
    status = "failed";
    errorMessage = error instanceof Error ? error.message : String(error);
  }

  const report = {
    milestone,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    gitCommit: spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: projectRoot,
      encoding: "utf8",
    }).stdout.trim(),
    checks,
    error: errorMessage,
  };

  const reportPath = path.join(verificationDirectory, `${milestone.toLowerCase()}-latest.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  process.stdout.write(`\n${milestone} verification ${status.toUpperCase()}\n`);
  process.stdout.write(`Evidence: ${path.relative(projectRoot, reportPath)}\n`);

  if (status !== "passed") {
    process.exitCode = 1;
  }
}

await main();
