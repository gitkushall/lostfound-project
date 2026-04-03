import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional().nullable(),
  profilePhotoUrl: z.string().optional().nullable(),
});

export async function GET() {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  const [profile, postsCount, returnedCount, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, bio: true, profilePhotoUrl: true, createdAt: true },
    }),
    prisma.itemPost.count({
      where: { postedByUserId: user.id },
    }),
    prisma.itemPost.count({
      where: { postedByUserId: user.id, status: "RETURNED" },
    }),
    prisma.itemPost.findMany({
      where: { postedByUserId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        claimRequests: {
          include: { requester: { select: { id: true, name: true } } },
        },
      },
    }),
  ]);

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...profile,
    stats: {
      postsCount,
      returnedCount,
    },
    posts,
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  try {
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
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, bio: true, profilePhotoUrl: true },
    });
    return NextResponse.json(updatedUser);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't update your profile. Please try again.");
  }
}
