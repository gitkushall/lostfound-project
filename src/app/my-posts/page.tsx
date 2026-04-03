import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MyPostsClient } from "@/components/MyPostsClient";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function MyPostsPage() {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  const items = await prisma.itemPost.findMany({
    where: { postedByUserId: user.id },
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
