import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaApiError } from "@/lib/prisma-errors";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";

export async function PATCH() {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    await prisma.notification.updateMany({
      where: { userId: user.id },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const prismaError = getPrismaApiError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: prismaError.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to mark all read" }, { status: 500 });
  }
}
