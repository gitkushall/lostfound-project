import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
      include: { user: true },
    });
    if (!record || new Date() > record.expiresAt) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    const passwordHash = await hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json({ message: "Password reset successful" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
