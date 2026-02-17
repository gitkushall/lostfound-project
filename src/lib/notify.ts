import { prisma } from "./prisma";
import { sendNotificationEmail } from "./email";

export async function createNotificationAndEmail(
  userId: string,
  type: string,
  data: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      data: JSON.stringify(data),
    },
  });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (user?.email) {
    const subject = type === "CLAIM_REQUEST"
      ? "Someone requested your found item"
      : type === "CLAIM_APPROVED"
        ? "Your claim was approved"
        : type === "NEW_MESSAGE"
          ? "New message about an item"
          : type === "ITEM_INFO"
            ? "Someone reported info about your lost item"
            : "Notification";
    const messagePreview = type === "NEW_MESSAGE" && data.messageBody
      ? `"${String(data.messageBody).slice(0, 150)}${String(data.messageBody).length > 150 ? "…" : ""}"`
      : "";
    const text = type === "CLAIM_REQUEST"
      ? `Someone requested to claim your found item.`
      : type === "CLAIM_APPROVED"
        ? `Your claim was approved. You can arrange pickup.`
        : type === "NEW_MESSAGE"
          ? (data.senderName ? `${data.senderName}: ` : "") + (messagePreview || "You have a new message about an item.")
          : type === "ITEM_INFO"
            ? `Someone reported information about your lost item.`
            : "You have a new notification.";
    await sendNotificationEmail(user.email, subject, text);
  }
  return notification;
}
