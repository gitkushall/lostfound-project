import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidatedSessionUser } from "@/lib/session-user";
import { getOrCreateConversationForItem } from "@/lib/conversations";
import { unauthorizedResponse } from "@/lib/authorization";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

export async function GET(req: NextRequest) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (itemId) {
    const conv = await prisma.conversation.findFirst({
      where: {
        itemId,
        OR: [
          { user1Id: user.id },
          { user2Id: user.id },
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
        { user1Id: user.id },
        { user2Id: user.id },
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
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return invalidJsonResponse();
    }
    const itemId =
      body && typeof body === "object" && "itemId" in body
        ? (body as { itemId?: unknown }).itemId
        : undefined;
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }
    const { conversation } = await getOrCreateConversationForItem(String(itemId), user.id);
    return NextResponse.json(conversation);
  } catch (e) {
    if (e instanceof Error && e.message === "Item not found.") {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    if (e instanceof Error && e.message === "You cannot start a conversation with yourself.") {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return apiErrorResponse(e, "We couldn't start this conversation. Please try again.");
  }
}
