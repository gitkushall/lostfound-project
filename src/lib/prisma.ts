import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Configure a PostgreSQL connection string before starting the app.");
}

if (process.env.VERCEL === "1" && databaseUrl.startsWith("file:")) {
  throw new Error("SQLite DATABASE_URL values are not supported on Vercel. Configure a PostgreSQL DATABASE_URL instead.");
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
