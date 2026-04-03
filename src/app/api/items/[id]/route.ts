import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";
import { requireOwnedItem, unauthorizedResponse } from "@/lib/authorization";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  locationText: z.string().min(1).optional(),
  dateOccurred: z.string().optional(),
  photoUrl: z.string().optional(),
  status: z.enum(["OPEN", "CLAIM_PENDING", "CLAIMED", "RETURNED"]).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.itemPost.findUnique({
      where: { id },
      include: {
        postedBy: { select: { id: true, name: true, profilePhotoUrl: true } },
        claimRequests: {
          include: { requester: { select: { id: true, name: true } } },
        },
      },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't load this post right now.");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const { id } = await params;
    const { response } = await requireOwnedItem(id, user.id);
    if (response) {
      return response;
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return invalidJsonResponse();
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dateOccurred)
      data.dateOccurred = new Date(parsed.data.dateOccurred);
    const updated = await prisma.itemPost.update({
      where: { id },
      data,
      include: { postedBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't save your changes. Please try again.");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
    const { id } = await params;
    const { response } = await requireOwnedItem(id, user.id);
    if (response) {
      return response;
    }
    // Only the post owner can delete; allowed for both LOST and FOUND, any status.
    // Remove any notifications referencing this item so no trace remains
    const notifications = await prisma.notification.findMany({
      where: { data: { contains: `"itemId":"${id}"` } },
    });
    for (const n of notifications) {
      await prisma.notification.delete({ where: { id: n.id } });
    }
    await prisma.itemPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't delete this post. Please try again.");
  }
}
