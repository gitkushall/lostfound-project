import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const postSchema = z.object({ emoji: z.string().min(1).max(10) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: conversationId, messageId } = await params;
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });
    if (!conv || (conv.user1Id !== session.user.id && conv.user2Id !== session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
    const existing = await prisma.messageReaction.findFirst({
      where: { messageId, userId: session.user.id, emoji: parsed.data.emoji },
    });
    if (existing) {
      return NextResponse.json(existing);
    }
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId: session.user.id,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id: conversationId, messageId } = await params;
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true },
    });
    if (!conv || (conv.user1Id !== session.user.id && conv.user2Id !== session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get("emoji");
    if (!emoji) {
      return NextResponse.json({ error: "emoji required" }, { status: 400 });
    }
    await prisma.messageReaction.deleteMany({
      where: { messageId, userId: session.user.id, emoji },
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: conversationId, messageId } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true },
  });
  if (!conv || (conv.user1Id !== session.user.id && conv.user2Id !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json(reactions);
}
