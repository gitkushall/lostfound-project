import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

type ApiError = {
  message: string;
  status: number;
};

export function getPrismaApiError(error: unknown): ApiError | null {
  if (error instanceof PrismaClientInitializationError) {
    const message = typeof error.message === "string" ? error.message : "";
    const isConnectionRefused =
      message.includes("Can't reach database server") ||
      message.includes("P1001") ||
      message.includes("localhost:5432");

    return {
      message: isConnectionRefused
        ? "Can't connect to PostgreSQL at localhost:5432. Start Postgres locally or update DATABASE_URL in .env to a reachable PostgreSQL database."
        : "Database connection failed. Check your PostgreSQL DATABASE_URL configuration.",
      status: 503,
    };
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        message: "An account with this email already exists.",
        status: 400,
      };
    }

    return {
      message: "Database request failed. Please try again in a moment.",
      status: 500,
    };
  }

  if (error instanceof PrismaClientValidationError) {
    return {
      message: "Database query validation failed. Please contact support if this continues.",
      status: 500,
    };
  }

  return null;
}
