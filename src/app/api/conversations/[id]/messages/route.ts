import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";
import {
  requireConversationParticipant,
  unauthorizedResponse,
} from "@/lib/authorization";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  const { id } = await params;
  const { response } = await requireConversationParticipant(id, user.id);
  if (response) {
    return response;
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
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const { id } = await params;
    const auth = await requireConversationParticipant(id, user.id);
    if (auth.response) {
      return auth.response;
    }
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: {
        item: { select: { id: true, title: true } },
      },
    });
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return invalidJsonResponse();
    }
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Write a message or attach a photo before sending." },
        { status: 400 }
      );
    }
    let replyToMessageId: string | null = null;
    if (parsed.data.replyToMessageId) {
      const replyTo = await prisma.message.findFirst({
        where: { id: parsed.data.replyToMessageId, conversationId: id },
      });
      if (replyTo) replyToMessageId = replyTo.id;
    }

    const senderId = user.id;
    const recipientId = conv.user1Id === senderId ? conv.user2Id : conv.user1Id;

    if (!senderId || !recipientId || senderId === recipientId) {
      return NextResponse.json(
        { error: "Invalid conversation participants" },
        { status: 409 }
      );
    }

    const participantCount = await prisma.user.count({
      where: { id: { in: [senderId, recipientId] } },
    });

    if (participantCount !== 2) {
      return NextResponse.json(
        { error: "Conversation participants are no longer available" },
        { status: 409 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId,
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
      senderId,
      senderName: message.sender.name,
      messageBody: preview,
    });
    return NextResponse.json(message);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't send your message. Please try again.");
  }
}
