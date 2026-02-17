import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      profilePhotoUrl: true,
      bio: true,
      emailVerified: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const postsCount = await prisma.itemPost.count({
    where: { postedByUserId: id },
  });
  return NextResponse.json({
    ...user,
    postsCount,
  });
}
