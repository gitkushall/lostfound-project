import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaApiError } from "@/lib/prisma-errors";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const { id } = await params;
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const prismaError = getPrismaApiError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: prismaError.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }
}
