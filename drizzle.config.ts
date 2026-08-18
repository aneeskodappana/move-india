import { config as loadEnvironment } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadEnvironment({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://demo_user:demo_password@localhost:5432/vandi_demo",
  },
  strict: true,
  verbose: true,
});
