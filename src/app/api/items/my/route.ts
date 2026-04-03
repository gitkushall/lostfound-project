import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";

export async function GET() {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const items = await prisma.itemPost.findMany({
      where: { postedByUserId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: { select: { id: true, name: true } },
        claimRequests: {
          include: { requester: { select: { id: true, name: true } } },
        },
      },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
