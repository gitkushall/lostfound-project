import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "item"; // item | profile
    if (!file || !file.size) {
      return NextResponse.json(
        { error: "No file or empty file" },
        { status: 400 }
      );
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }
    const ext = path.extname(file.name) || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const dir = type === "profile" ? "public/uploads/profile" : "public/uploads/items";
    const dirPath = path.join(process.cwd(), dir);
    await mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));
    const url = `/${dir.replace("public/", "")}/${name}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
