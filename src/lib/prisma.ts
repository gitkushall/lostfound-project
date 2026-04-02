import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;
const isPostgresUrl =
  !!databaseUrl &&
  (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"));

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Configure a PostgreSQL connection string before starting the app.");
}

if (!isPostgresUrl) {
  throw new Error(
    `DATABASE_URL must be a PostgreSQL connection string starting with postgresql:// or postgres://. Received: ${databaseUrl}`
  );
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
