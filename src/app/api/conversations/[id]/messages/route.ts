import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const conv = await prisma.conversation.findUnique({
    where: { id },
    select: { user1Id: true, user2Id: true },
  });
  if (!conv || (conv.user1Id !== session.user.id && conv.user2Id !== session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, profilePhotoUrl: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      replyTo: {
        select: {
          id: true,
          body: true,
          imageUrl: true,
          sender: { select: { name: true } },
        },
      },
    },
  });
  return NextResponse.json(messages);
}

const postSchema = z.object({
  body: z.string().max(2000).default(""),
  imageUrl: z.string().url().optional(),
  replyToMessageId: z.string().cuid().optional(),
}).refine((d) => d.body.trim().length > 0 || d.imageUrl, { message: "Message must have text or image" });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: { item: { select: { id: true, title: true } } },
    });
    if (!conv || (conv.user1Id !== session.user.id && conv.user2Id !== session.user.id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    let replyToMessageId: string | null = null;
    if (parsed.data.replyToMessageId) {
      const replyTo = await prisma.message.findFirst({
        where: { id: parsed.data.replyToMessageId, conversationId: id },
      });
      if (replyTo) replyToMessageId = replyTo.id;
    }
    const recipientId = conv.user1Id === session.user.id ? conv.user2Id : conv.user1Id;
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        body: parsed.data.body?.trim() ?? "",
        imageUrl: parsed.data.imageUrl ?? null,
        replyToMessageId,
      },
      include: {
        sender: { select: { id: true, name: true, profilePhotoUrl: true } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
        replyTo: {
          select: {
            id: true,
            body: true,
            imageUrl: true,
            sender: { select: { name: true } },
          },
        },
      },
    });
    const preview = parsed.data.body?.trim()?.slice(0, 200) || (parsed.data.imageUrl ? "[Image]" : "");
    await createNotificationAndEmail(recipientId, "NEW_MESSAGE", {
      conversationId: id,
      itemId: conv.item.id,
      itemTitle: conv.item.title,
      senderName: message.sender.name,
      messageBody: preview,
    });
    return NextResponse.json(message);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
