import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditPostForm } from "@/components/EditPostForm";

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
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { id } = await params;
  const item = await prisma.itemPost.findUnique({ where: { id } });
  if (!item || item.postedByUserId !== session.user?.id) notFound();
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit post</h1>
      <EditPostForm item={JSON.parse(JSON.stringify(item))} categories={CATEGORIES} />
    </div>
  );
}
