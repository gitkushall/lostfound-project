import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";

const createSchema = z.object({
  itemId: z.string(),
  message: z.string().optional(),
  verificationAnswers: z.record(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { itemId, message, verificationAnswers } = parsed.data;

    const item = await prisma.itemPost.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (item.type !== "FOUND") {
      return NextResponse.json(
        { error: "Claims are only for FOUND items" },
        { status: 400 }
      );
    }
    if (item.postedByUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot claim your own post" },
        { status: 400 }
      );
    }
    if (item.status !== "OPEN" && item.status !== "PENDING") {
      return NextResponse.json(
        { error: "This item is no longer available for claims" },
        { status: 400 }
      );
    }

    const existing = await prisma.claimRequest.findFirst({
      where: { itemId, requesterUserId: session.user.id, status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending claim for this item" },
        { status: 400 }
      );
    }

    const claim = await prisma.claimRequest.create({
      data: {
        itemId,
        requesterUserId: session.user.id,
        message: message ?? null,
        verificationAnswers: verificationAnswers
          ? JSON.stringify(verificationAnswers)
          : null,
      },
      include: {
        item: true,
        requester: { select: { id: true, name: true } },
      },
    });

    await prisma.itemPost.update({
      where: { id: itemId },
      data: { status: "PENDING" },
    });

    await createNotificationAndEmail(item.postedByUserId, "CLAIM_REQUEST", {
      claimId: claim.id,
      itemId,
      itemTitle: item.title,
      requesterName: claim.requester.name,
    });

    return NextResponse.json(claim);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}
