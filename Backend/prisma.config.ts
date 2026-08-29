import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  datasource: {
    // Runtime traffic goes through Supabase's pooler (port 6543). Migrations
    // and introspection must use the direct connection (port 5432) — PgBouncer
    // in transaction mode cannot run the DDL and advisory locks Prisma needs.
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
