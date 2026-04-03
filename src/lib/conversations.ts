import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const conversationInclude = {
  item: { select: { id: true, title: true, type: true } },
  user1: { select: { id: true, name: true, profilePhotoUrl: true } },
  user2: { select: { id: true, name: true, profilePhotoUrl: true } },
} satisfies Prisma.ConversationInclude;

export function getConversationParticipantIds(
  currentUserId: string,
  otherUserId: string
) {
  if (!currentUserId || !otherUserId) {
    throw new Error("Both conversation participants are required.");
  }

  if (currentUserId === otherUserId) {
    throw new Error("You cannot start a conversation with yourself.");
  }

  return currentUserId < otherUserId
    ? { user1Id: currentUserId, user2Id: otherUserId }
    : { user1Id: otherUserId, user2Id: currentUserId };
}

export async function getOrCreateConversationForItem(
  itemId: string,
  currentUserId: string
) {
  const item = await prisma.itemPost.findUnique({
    where: { id: itemId },
    include: { postedBy: { select: { id: true, name: true, profilePhotoUrl: true } } },
  });

  if (!item) {
    throw new Error("Item not found.");
  }

  const { user1Id, user2Id } = getConversationParticipantIds(
    currentUserId,
    item.postedBy.id
  );

  const existingConversation = await prisma.conversation.findUnique({
    where: {
      itemId_user1Id_user2Id: {
        itemId,
        user1Id,
        user2Id,
      },
    },
    include: conversationInclude,
  });

  if (existingConversation) {
    return { item, conversation: existingConversation };
  }

  try {
    const conversation = await prisma.conversation.create({
      data: { itemId, user1Id, user2Id },
      include: conversationInclude,
    });

    return { item, conversation };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conversation = await prisma.conversation.findUnique({
        where: {
          itemId_user1Id_user2Id: {
            itemId,
            user1Id,
            user2Id,
          },
        },
        include: conversationInclude,
      });

      if (conversation) {
        return { item, conversation };
      }
    }

    throw error;
  }
}
