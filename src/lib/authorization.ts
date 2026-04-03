import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function requireOwnedItem(itemId: string, userId: string) {
  const item = await prisma.itemPost.findUnique({ where: { id: itemId } });

  if (!item) {
    return { response: notFoundResponse() };
  }

  if (item.postedByUserId !== userId) {
    return { response: forbiddenResponse("Only the post owner can do that.") };
  }

  return { item };
}

export async function requireConversationParticipant(
  conversationId: string,
  userId: string
) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, itemId: true, user1Id: true, user2Id: true },
  });

  if (!conversation) {
    return { response: notFoundResponse() };
  }

  if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
    return { response: notFoundResponse() };
  }

  return { conversation };
}
