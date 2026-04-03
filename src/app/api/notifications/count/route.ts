import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaApiError } from "@/lib/prisma-errors";
import { getValidatedSessionUser } from "@/lib/session-user";

export async function GET() {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });
    return NextResponse.json({ count });
  } catch (error) {
    const prismaError = getPrismaApiError(error);
    if (prismaError) {
      return NextResponse.json({ count: 0, unavailable: true }, { status: 200 });
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to fetch notification count" }, { status: 500 });
  }
}
