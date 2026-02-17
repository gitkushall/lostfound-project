import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (itemId) {
    const conv = await prisma.conversation.findFirst({
      where: {
        itemId,
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
      include: {
        item: { select: { id: true, title: true, type: true } },
        user1: { select: { id: true, name: true, profilePhotoUrl: true } },
        user2: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });
    return NextResponse.json(conv);
  }
  const list = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: session.user.id },
        { user2Id: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      item: { select: { id: true, title: true, type: true } },
      user1: { select: { id: true, name: true, profilePhotoUrl: true } },
      user2: { select: { id: true, name: true, profilePhotoUrl: true } },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }
    const item = await prisma.itemPost.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    const otherId = item.postedByUserId;
    if (otherId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot start a conversation with yourself" },
        { status: 400 }
      );
    }
    const user1Id = session.user.id < otherId ? session.user.id : otherId;
    const user2Id = session.user.id < otherId ? otherId : session.user.id;
    let conv = await prisma.conversation.findFirst({
      where: { itemId, user1Id, user2Id },
      include: {
        item: { select: { id: true, title: true, type: true } },
        user1: { select: { id: true, name: true, profilePhotoUrl: true } },
        user2: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { itemId, user1Id, user2Id },
        include: {
          item: { select: { id: true, title: true, type: true } },
          user1: { select: { id: true, name: true, profilePhotoUrl: true } },
          user2: { select: { id: true, name: true, profilePhotoUrl: true } },
        },
      });
    }
    return NextResponse.json(conv);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
