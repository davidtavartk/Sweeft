import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/database/schema/*",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true,
  },
});
