import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

const schema = z.object({
  itemId: z.string(),
  type: z.enum(["INFO", "SEEN", "RETURNED_TO_DESK"]).optional(),
  message: z.string().trim().min(1, "Please add a short note."),
});

export async function POST(req: Request) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return invalidJsonResponse();
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { itemId, message } = parsed.data;
    const type = parsed.data.type ?? "INFO";
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
      data: { itemId, userId: user.id, type, message },
      include: { user: { select: { name: true } } },
    });

    await createNotificationAndEmail(item.postedByUserId, "ITEM_INFO", {
      itemId,
      itemTitle: item.title,
      type,
      reporterName: update.user.name,
      message,
    });

    return NextResponse.json(update);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't submit that information. Please try again.");
  }
}
