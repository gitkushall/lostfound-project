import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  locationText: z.string().min(1),
  dateOccurred: z.string(),
  photoUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // LOST | FOUND | null = all
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {};
    if (type && ["LOST", "FOUND"].includes(type)) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (location) where.locationText = { contains: location };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.dateOccurred = {};
      if (dateFrom) (where.dateOccurred as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.dateOccurred as Record<string, Date>).lte = new Date(dateTo);
    }

    const orderBy = sort === "newest"
      ? { createdAt: "desc" as const }
      : { dateOccurred: "desc" as const };

    const items = await prisma.itemPost.findMany({
      where,
      orderBy,
      include: {
        postedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

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
    const data = {
      ...parsed.data,
      dateOccurred: new Date(parsed.data.dateOccurred),
      postedByUserId: session.user.id,
    };
    const item = await prisma.itemPost.create({
      data,
      include: { postedBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
