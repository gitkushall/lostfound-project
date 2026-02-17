import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await prisma.itemPost.findMany({
      where: { postedByUserId: session.user.id },
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
