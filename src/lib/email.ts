import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const FROM = process.env.EMAIL_FROM || "LostFound <noreply@lostfound.local>";
const APP_NAME = "LostFound @ WPUNJ";

export async function sendVerificationEmail(email: string, code: string) {
  const text = `Your ${APP_NAME} verification code is: ${code}. It expires in 15 minutes.`;
  const html = `<p>Your <strong>${APP_NAME}</strong> verification code is: <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`;
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Verify your ${APP_NAME} account`,
      text,
      html,
    });
  } catch (e) {
    console.error("Send verification email failed:", e);
    throw e;
  }
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `[${APP_NAME}] ${subject}`,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });
  } catch (e) {
    console.error("Send notification email failed:", e);
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const text = `Reset your password: ${resetLink}. This link expires in 1 hour.`;
  const html = `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`;
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      text,
      html,
    });
  } catch (e) {
    console.error("Send password reset email failed:", e);
    throw e;
  }
}
