import { redirect } from "next/navigation";
import { CreatePostForm } from "@/components/CreatePostForm";
import { HomeFeed } from "@/components/HomeFeed";
import { ITEM_CATEGORIES } from "@/lib/item-options";
import { getValidatedSessionUser } from "@/lib/session-user";

export default async function PostPage() {
  const user = await getValidatedSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-6">
      <section className="rounded-3xl border border-wpu-black/10 bg-white p-6 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wpu-orange">
            Search
          </p>
          <h1 className="mt-2 text-3xl font-bold text-wpu-black">Check the feed first</h1>
        </div>
        <div className="mt-5">
          <HomeFeed showCreateCard={false} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-xl">
        <h2 className="text-2xl font-bold text-wpu-black">Create post</h2>
        <CreatePostForm categories={[...ITEM_CATEGORIES]} />
      </section>
    </div>
  );
}
