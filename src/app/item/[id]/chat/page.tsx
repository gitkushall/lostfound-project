import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemChatClient } from "@/components/ItemChatClient";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function ItemChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  const currentUserId = user.id;
  const { id: itemId } = await params;
  const { conversation: conversationId } = await searchParams;
  const item = await prisma.itemPost.findUnique({
    where: { id: itemId },
    include: { postedBy: { select: { id: true, name: true } } },
  });
  if (!item) notFound();
  const isOwner = item.postedBy.id === currentUserId;

  const baseWhere = {
    itemId,
    OR: [
      { user1Id: currentUserId },
      { user2Id: currentUserId },
    ],
  };

  let conv = conversationId
    ? await prisma.conversation.findFirst({
        where: { ...baseWhere, id: conversationId },
        include: {
          user1: { select: { id: true, name: true, profilePhotoUrl: true } },
          user2: { select: { id: true, name: true, profilePhotoUrl: true } },
        },
      })
    : await prisma.conversation.findFirst({
        where: baseWhere,
        include: {
          user1: { select: { id: true, name: true, profilePhotoUrl: true } },
          user2: { select: { id: true, name: true, profilePhotoUrl: true } },
        },
      });

  if (!conv && !isOwner) {
    const user1Id = currentUserId < item.postedBy.id ? currentUserId : item.postedBy.id;
    const user2Id = currentUserId < item.postedBy.id ? item.postedBy.id : currentUserId;

    conv = await prisma.conversation.create({
      data: { itemId, user1Id, user2Id },
      include: {
        user1: { select: { id: true, name: true, profilePhotoUrl: true } },
        user2: { select: { id: true, name: true, profilePhotoUrl: true } },
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ItemChatClient
        itemId={itemId}
        itemTitle={item.title}
        conversation={conv ? JSON.parse(JSON.stringify(conv)) : null}
        currentUserId={currentUserId}
        posterName={item.postedBy.name}
        canStartConversation={!isOwner}
      />
    </div>
  );
}
