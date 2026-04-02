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
    return {
      message: "Database connection failed. Check your PostgreSQL DATABASE_URL and DIRECT_URL configuration.",
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
