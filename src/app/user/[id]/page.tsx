import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      profilePhotoUrl: true,
      bio: true,
      emailVerified: true,
    },
  });
  if (!user) notFound();
  const postsCount = await prisma.itemPost.count({
    where: { postedByUserId: id },
  });
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-wpu-black/10 bg-wpu-gray-light">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-wpu-black/50">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-wpu-black">{user.name}</h1>
            {user.emailVerified && (
              <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Verified account
              </span>
            )}
            <p className="mt-2 text-sm text-wpu-black-light">{postsCount} post{postsCount !== 1 ? "s" : ""}</p>
            {user.bio && <p className="mt-4 text-wpu-black-light">{user.bio}</p>}
          </div>
        </div>
      </div>
      <Link href="/" className="mt-6 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to feed
      </Link>
    </div>
  );
}
