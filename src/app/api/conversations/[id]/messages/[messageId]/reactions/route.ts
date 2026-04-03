import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";

const postSchema = z.object({ emoji: z.string().min(1).max(10) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: conversationId, messageId } = await params;
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });
    if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
    const existing = await prisma.messageReaction.findFirst({
      where: { messageId, userId: user.id, emoji: parsed.data.emoji },
    });
    if (existing) {
      return NextResponse.json(existing);
    }
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: user.id,
        emoji: parsed.data.emoji,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    return NextResponse.json(reaction);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: conversationId, messageId } = await params;
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });
    if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get("emoji");
    if (!emoji) {
      return NextResponse.json({ error: "emoji required" }, { status: 400 });
    }
    await prisma.messageReaction.deleteMany({
      where: { messageId, userId: user.id, emoji },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: conversationId, messageId } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(reactions);
}
