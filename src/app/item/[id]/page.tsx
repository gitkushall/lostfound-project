import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ItemDetailClient } from "@/components/ItemDetailClient";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { id } = await params;
  const item = await prisma.itemPost.findUnique({
    where: { id },
    include: {
      postedBy: { select: { id: true, name: true } },
      claimRequests: {
        include: { requester: { select: { id: true, name: true } } },
      },
      infoUpdates: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <ItemDetailClient
        item={JSON.parse(JSON.stringify(item))}
        currentUserId={session.user?.id ?? ""}
      />
    </div>
  );
}
