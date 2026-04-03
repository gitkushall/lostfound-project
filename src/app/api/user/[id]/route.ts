import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getValidatedSessionUser } from "@/lib/session-user";
import { unauthorizedResponse } from "@/lib/authorization";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getValidatedSessionUser();
  if (!user) {
    return unauthorizedResponse();
  }
  const { id } = await params;
  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      profilePhotoUrl: true,
      bio: true,
      emailVerified: true,
    },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const postsCount = await prisma.itemPost.count({
    where: { postedByUserId: id },
  });
  return NextResponse.json({
    ...profile,
    postsCount,
  });
}
