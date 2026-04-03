import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrismaApiError } from "@/lib/prisma-errors";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";

export async function GET() {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    const prismaError = getPrismaApiError(error);
    if (prismaError) {
      return NextResponse.json({ error: prismaError.message }, { status: prismaError.status });
    }

    console.error(error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
