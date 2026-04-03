import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/StatusBadge";

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
  const [postsCount, recentPosts] = await Promise.all([
    prisma.itemPost.count({
      where: { postedByUserId: id },
    }),
    prisma.itemPost.findMany({
      where: { postedByUserId: id },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        locationText: true,
        status: true,
        dateOccurred: true,
      },
    }),
  ]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-wpu-black/10 bg-wpu-gray-light">
            {user.profilePhotoUrl ? (
              <Image
                src={user.profilePhotoUrl}
                alt={`${user.name}'s profile photo`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
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
      <section className="mt-6 rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-wpu-black">Recent posts</h2>
            <p className="mt-1 text-sm text-wpu-black/65">Current activity and item status at a glance.</p>
          </div>
          <span className="rounded-full bg-wpu-gray-light px-3 py-1 text-xs font-semibold text-wpu-black/70">
            {postsCount} total
          </span>
        </div>
        {recentPosts.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-wpu-black/15 bg-wpu-gray-light/60 px-4 py-8 text-center text-sm text-wpu-black/60">
            No posts yet.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {recentPosts.map((post) => {
              const occurredOn = new Date(post.dateOccurred).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <li key={post.id}>
                  <Link
                    href={`/item/${post.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-wpu-black/10 bg-wpu-gray-light/40 p-4 transition-colors hover:bg-wpu-gray-light"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          post.type === "LOST" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {post.type}
                      </span>
                      <StatusBadge status={post.status} />
                    </div>
                    <div>
                      <p className="font-semibold text-wpu-black">{post.title}</p>
                      <p className="mt-1 text-sm text-wpu-black/65">
                        {post.category} · {post.locationText} · {occurredOn}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <Link href="/" className="mt-6 inline-block font-medium text-wpu-orange hover:underline">
        ← Back to feed
      </Link>
    </div>
  );
}
