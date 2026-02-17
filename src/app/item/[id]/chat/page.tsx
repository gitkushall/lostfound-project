import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemChatClient } from "@/components/ItemChatClient";

export default async function ItemChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { id: itemId } = await params;
  const { conversation: conversationId } = await searchParams;
  const item = await prisma.itemPost.findUnique({
    where: { id: itemId },
    include: { postedBy: { select: { id: true, name: true } } },
  });
  if (!item) notFound();

  const baseWhere = {
    itemId,
    OR: [
      { user1Id: session.user?.id },
      { user2Id: session.user?.id },
    ],
  } as const;

  const conv = conversationId
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ItemChatClient
        itemId={itemId}
        itemTitle={item.title}
        conversation={conv ? JSON.parse(JSON.stringify(conv)) : null}
        currentUserId={session.user?.id ?? ""}
        posterName={item.postedBy.name}
      />
    </div>
  );
}
