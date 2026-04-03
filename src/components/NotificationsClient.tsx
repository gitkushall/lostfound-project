"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppErrorState } from "./AppErrorState";
import { getErrorMessage } from "@/lib/client-errors";

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
  const [error, setError] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Couldn't load notifications right now."));
      }

      setList(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Couldn't load notifications right now."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markRead(id: string) {
    setError(null);
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(getErrorMessage(data, "Couldn't mark this notification as read."));
      }
      setList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Couldn't mark this notification as read."));
    }
  }

  async function markAllRead() {
    setError(null);
    try {
      const response = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(getErrorMessage(data, "Couldn't mark notifications as read."));
      }
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Couldn't mark notifications as read."));
    }
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
          <p className="font-medium text-wpu-black">New message</p>
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
          <p className="font-medium text-wpu-black">New claim</p>
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
          <p className="font-medium text-wpu-black">Claim approved</p>
          <p className="text-sm text-wpu-black/80">
            &quot;{data.itemTitle}&quot; is ready for pickup.
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

  if (error && list.length === 0) {
    return (
      <div className="mt-6">
        <AppErrorState
          title="Notifications unavailable"
          message={error}
          actionLabel="Try again"
          onAction={() => {
            void loadNotifications();
          }}
        />
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
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={markAllRead}
          className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light hover:underline"
        >
          Mark all read
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
