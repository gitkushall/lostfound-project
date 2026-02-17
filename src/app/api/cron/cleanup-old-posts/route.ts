import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INACTIVE_DAYS = 30;

/**
 * Auto-delete posts that have had no claim activity for 30+ days.
 * Call via cron (e.g. daily): GET /api/cron/cleanup-old-posts
 * Optionally protect with Authorization header or CRON_SECRET.
 */
export async function GET() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

    const oldPosts = await prisma.itemPost.findMany({
      where: { createdAt: { lt: cutoff } },
      select: { id: true },
    });

    let deleted = 0;
    for (const post of oldPosts) {
      const hasRecentClaim = await prisma.claimRequest.findFirst({
        where: { itemId: post.id, createdAt: { gte: cutoff } },
      });
      const hasRecentMessage = await prisma.conversation.findFirst({
        where: { itemId: post.id },
        include: {
          messages: {
            where: { createdAt: { gte: cutoff } },
            take: 1,
          },
        },
      });
      const hasRecentActivity =
        hasRecentClaim || (hasRecentMessage?.messages && hasRecentMessage.messages.length > 0);
      if (!hasRecentActivity) {
        const notifications = await prisma.notification.findMany({
          where: { data: { contains: `"itemId":"${post.id}"` } },
        });
        for (const n of notifications) {
          await prisma.notification.delete({ where: { id: n.id } });
        }
        await prisma.itemPost.delete({ where: { id: post.id } });
        deleted++;
      }
    }

    return NextResponse.json({ deleted, total: oldPosts.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
