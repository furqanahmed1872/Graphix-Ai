// Backend/prisma/client.js
import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set. Copy .env.example to .env.");
  process.exit(1);
}

// Prisma 7 uses the "client" query engine, which requires a driver adapter.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;
