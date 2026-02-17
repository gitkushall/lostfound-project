import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreatePostForm } from "@/components/CreatePostForm";

const CATEGORIES = [
  "Keys",
  "Wallet / ID",
  "Phone",
  "Electronics",
  "Bag / Backpack",
  "Clothing",
  "Books",
  "Other",
];

export default async function PostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold text-wpu-black">Create post</h1>
      <CreatePostForm categories={CATEGORIES} />
    </div>
  );
}
