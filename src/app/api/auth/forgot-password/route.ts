import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({ email: z.string().email() });

function getAppBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return NextResponse.json({ message: "If an account exists, you will receive a reset link." });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    const baseUrl = getAppBaseUrl();
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetLink);
    return NextResponse.json({ message: "If an account exists, you will receive a reset link." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
