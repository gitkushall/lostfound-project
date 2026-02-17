import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationAndEmail } from "@/lib/notify";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["APPROVED", "DENIED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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
    if (claim.item.postedByUserId !== session.user.id) {
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
      await prisma.itemPost.update({
        where: { id: claim.itemId },
        data: { status: "RETURNED" },
      });
      await createNotificationAndEmail(claim.requesterUserId, "CLAIM_APPROVED", {
        claimId: id,
        itemId: claim.itemId,
        itemTitle: claim.item.title,
      });
    } else {
      await prisma.itemPost.update({
        where: { id: claim.itemId },
        data: { status: "OPEN" },
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
