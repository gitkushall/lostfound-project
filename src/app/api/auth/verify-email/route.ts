import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or code" },
        { status: 400 }
      );
    }
    const { email, code } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.verificationCode || !user.verificationCodeExpiresAt) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }
    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }
    if (new Date() > user.verificationCodeExpiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
