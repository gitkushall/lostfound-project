import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MyPostsClient } from "@/components/MyPostsClient";

export default async function MyPostsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const items = await prisma.itemPost.findMany({
    where: { postedByUserId: session.user?.id ?? "" },
    orderBy: { createdAt: "desc" },
    include: {
      postedBy: { select: { id: true, name: true } },
      claimRequests: {
        include: { requester: { select: { id: true, name: true } } },
      },
    },
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold text-wpu-black">My posts</h1>
      <MyPostsClient items={JSON.parse(JSON.stringify(items))} />
    </div>
  );
}
