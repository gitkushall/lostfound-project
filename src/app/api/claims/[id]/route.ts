import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "DENIED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const claim = await prisma.claimRequest.findUnique({
      where: { id },
      include: { item: true },
    });
    if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (claim.item.postedByUserId !== user.id) {
      return NextResponse.json({ error: "Only the poster can approve/deny" }, { status: 403 });
    }
    if (claim.status !== "PENDING") {
      return NextResponse.json(
        { error: "This claim has already been processed" },
        { status: 400 }
      );
    }

    await prisma.claimRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    if (parsed.data.status === "APPROVED") {
      await prisma.claimRequest.updateMany({
        where: { itemId: claim.itemId, id: { not: id }, status: "PENDING" },
        data: { status: "DENIED" },
      });
      await prisma.itemPost.update({
        where: { id: claim.itemId },
        data: { status: "CLAIMED" },
      });
      await createNotificationAndEmail(claim.requesterUserId, "CLAIM_APPROVED", {
        claimId: id,
        itemId: claim.itemId,
        itemTitle: claim.item.title,
      });
    } else {
      const otherPendingClaims = await prisma.claimRequest.count({
        where: { itemId: claim.itemId, status: "PENDING" },
      });
      await prisma.itemPost.update({
        where: { id: claim.itemId },
        data: { status: otherPendingClaims > 0 ? "CLAIM_PENDING" : "OPEN" },
      });
    }

    const updated = await prisma.claimRequest.findUnique({
      where: { id },
      include: { item: true, requester: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
