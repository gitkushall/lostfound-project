import { NextResponse } from "next/server";
import { getPrismaApiError } from "@/lib/prisma-errors";

export function invalidJsonResponse() {
  return NextResponse.json(
    { error: "We couldn't read that request. Please try again." },
    { status: 400 }
  );
}

export function apiErrorResponse(error: unknown, fallback: string) {
  const prismaError = getPrismaApiError(error);
  if (prismaError) {
    return NextResponse.json({ error: prismaError.message }, { status: prismaError.status });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}
