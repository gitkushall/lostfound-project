import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";

const schema = z.object({
  itemId: z.string(),
  type: z.enum(["SEEN", "RETURNED_TO_DESK"]),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { itemId, type, message } = parsed.data;
    const item = await prisma.itemPost.findUnique({
      where: { id: itemId },
      include: { postedBy: { select: { name: true } } },
    });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (item.type !== "LOST") {
      return NextResponse.json(
        { error: "Info updates are only for LOST items" },
        { status: 400 }
      );
    }
    if (item.postedByUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot report info on your own post" },
        { status: 400 }
      );
    }

    const update = await prisma.itemInfoUpdate.create({
      data: { itemId, userId: user.id, type, message: message ?? null },
      include: { user: { select: { name: true } } },
    });

    await createNotificationAndEmail(item.postedByUserId, "ITEM_INFO", {
      itemId,
      itemTitle: item.title,
      type,
      reporterName: update.user.name,
      message: message ?? null,
    });

    return NextResponse.json(update);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit info" }, { status: 500 });
  }
}
