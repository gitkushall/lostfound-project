import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getValidatedSessionUser } from "@/lib/session-user";
import { apiErrorResponse, invalidJsonResponse } from "@/lib/api-errors";

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

    const where: Prisma.ItemPostWhereInput = {};
    if (type && ["LOST", "FOUND"].includes(type)) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;
    if (location) {
      where.locationText = { contains: location, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { locationText: { contains: search, mode: "insensitive" } },
      ];
    }
    if (dateFrom || dateTo) {
      where.dateOccurred = {};
      if (dateFrom) {
        where.dateOccurred.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        where.dateOccurred.lte = endOfDay;
      }
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
    return apiErrorResponse(e, "Couldn't load posts right now. Please try again.");
  }
}

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
      postedByUserId: user.id,
    };
    const item = await prisma.itemPost.create({
      data,
      include: { postedBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(item);
  } catch (e) {
    console.error(e);
    return apiErrorResponse(e, "We couldn't create your post. Please try again.");
  }
}
