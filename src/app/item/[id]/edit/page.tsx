import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditPostForm } from "@/components/EditPostForm";
import { getValidatedSessionUser } from "@/lib/session-user";

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

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getValidatedSessionUser();
  if (!user) notFound();
  const { id } = await params;
  const item = await prisma.itemPost.findUnique({ where: { id } });
  if (!item || item.postedByUserId !== user.id) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit post</h1>
      <EditPostForm item={JSON.parse(JSON.stringify(item))} categories={CATEGORIES} />
    </div>
  );
}
