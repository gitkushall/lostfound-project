import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrismaApiError } from "@/lib/prisma-errors";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
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
