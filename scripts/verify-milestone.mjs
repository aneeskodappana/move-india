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
    if (!html.includes("Know what is collected") || !html.includes("Independent hackathon prototype")) {
      throw new Error("Production HTML is missing the expected foundation content.");
    }

    record(checks, "Production HTTP smoke test", "passed", "HTTP 200 with expected content");
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
