"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsClient() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function renderNotification(n: Notification) {
    let data: { itemId?: string; itemTitle?: string; requesterName?: string; conversationId?: string; messageBody?: string; senderName?: string } = {};
    try {
      if (n.data) data = JSON.parse(n.data);
    } catch {
      // ignore
    }
    const itemLink = data.itemId ? `/item/${data.itemId}` : "#";
    const chatLink =
      data.conversationId && data.itemId
        ? `/item/${data.itemId}/chat?conversation=${data.conversationId}`
        : itemLink;

    if (n.type === "NEW_MESSAGE") {
      return (
        <Link
          href={chatLink}
          onClick={() => !n.isRead && markRead(n.id)}
          className={`block rounded-lg border p-4 transition-colors ${
            n.isRead ? "border-wpu-black/10 bg-white" : "border-wpu-orange/30 bg-wpu-orange/10"
          }`}
        >
          <p className="font-medium text-wpu-black">New message about an item</p>
          <p className="text-sm text-wpu-black/80">
            {data.senderName && <span className="font-medium">{data.senderName}: </span>}
            {data.messageBody ? `"${data.messageBody.slice(0, 120)}${(data.messageBody as string).length > 120 ? "…" : ""}"` : "New message"}
          </p>
          <p className="mt-1 text-xs text-wpu-black/60">{new Date(n.createdAt).toLocaleString()}</p>
        </Link>
      );
    }
    if (n.type === "CLAIM_REQUEST") {
      return (
        <Link
          href={itemLink}
          onClick={() => !n.isRead && markRead(n.id)}
          className={`block rounded-lg border p-4 transition-colors ${
            n.isRead ? "border-wpu-black/10 bg-white" : "border-wpu-orange/30 bg-wpu-orange/10"
          }`}
        >
          <p className="font-medium text-wpu-black">Someone requested your found item</p>
          <p className="text-sm text-wpu-black/80">
            {data.requesterName} requested to claim &quot;{data.itemTitle}&quot;
          </p>
          <p className="mt-1 text-xs text-wpu-black/60">
            {new Date(n.createdAt).toLocaleString()}
          </p>
        </Link>
      );
    }
    if (n.type === "CLAIM_APPROVED") {
      return (
        <Link
          href={itemLink}
          onClick={() => !n.isRead && markRead(n.id)}
          className={`block rounded-lg border p-4 transition-colors ${
            n.isRead
              ? "border-wpu-black/10 bg-white" : "border-wpu-orange/30 bg-wpu-orange/10"
          }`}
        >
          <p className="font-medium text-wpu-black">Your claim was approved</p>
          <p className="text-sm text-wpu-black/80">
            &quot;{data.itemTitle}&quot; — you can arrange pickup with the poster.
          </p>
          <p className="mt-1 text-xs text-wpu-black/60">{new Date(n.createdAt).toLocaleString()}</p>
        </Link>
      );
    }
    return (
      <div className={`rounded-lg border p-4 ${n.isRead ? "border-wpu-black/10 bg-white" : "bg-wpu-gray-light"}`}>
        <p className="text-sm text-wpu-black/80">{n.type}</p>
        <p className="mt-1 text-xs text-wpu-black/60">{new Date(n.createdAt).toLocaleString()}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-6 flex justify-center py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-wpu-orange border-t-transparent" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-wpu-black/20 bg-wpu-gray-light py-12 text-center text-wpu-gray">
        No notifications yet.
      </div>
    );
  }

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="mt-6 space-y-4">
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          className="text-sm font-medium text-wpu-black hover:underline"
        >
          Mark all as read
        </button>
      )}
      <ul className="space-y-3">
        {list.map((n) => (
          <li key={n.id}>{renderNotification(n)}</li>
        ))}
      </ul>
    </div>
  );
}
