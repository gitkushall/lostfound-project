"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Reaction = {
  id: string;
  emoji: string;
  userId: string;
  user: { id: string; name: string };
};

type Message = {
  id: string;
  body: string;
  imageUrl: string | null;
  senderId: string;
  replyToMessageId: string | null;
  createdAt: string;
  sender: { id: string; name: string; profilePhotoUrl: string | null };
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    body: string;
    imageUrl: string | null;
    sender: { name: string };
  } | null;
};

type Conversation = {
  id: string;
  itemId: string;
  user1: { id: string; name: string; profilePhotoUrl: string | null };
  user2: { id: string; name: string; profilePhotoUrl: string | null };
};

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export function ItemChatClient({
  itemId,
  itemTitle,
  conversation: initialConv,
  currentUserId,
  posterName,
}: {
  itemId: string;
  itemTitle: string;
  conversation: Conversation | null;
  currentUserId: string;
  posterName: string;
}) {
  const [conv, setConv] = useState<Conversation | null>(initialConv);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reactionMenu, setReactionMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(!initialConv);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConv) {
      setConv(initialConv);
      setLoading(false);
      fetch(`/api/conversations/${initialConv.id}/messages`)
        .then((r) => r.json())
        .then(setMessages)
        .catch(() => {});
      return;
    }
    fetch("/api/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setConv(data);
        setMessages([]);
      })
      .catch(() => setConv(null))
      .finally(() => setLoading(false));
  }, [itemId, initialConv?.id]);

  useEffect(() => {
    if (!conv?.id) return;
    const interval = setInterval(() => {
      fetch(`/api/conversations/${conv.id}/messages`)
        .then((r) => r.json())
        .then(setMessages)
        .catch(() => {});
    }, 1200);
    return () => clearInterval(interval);
  }, [conv?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherUser = conv?.user1.id === currentUserId ? conv?.user2 : conv?.user1;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!body.trim() && !uploadingImage) || !conv?.id || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim() || undefined,
          replyToMessageId: replyingTo?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setBody("");
        setReplyingTo(null);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !conv?.id || sending) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "item");
      const up = await fetch("/api/upload", { method: "POST", body: formData });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");
      const res = await fetch(`/api/conversations/${conv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: "",
          imageUrl: upData.url,
          replyToMessageId: replyingTo?.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setReplyingTo(null);
      }
    } catch {
      // could toast
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  }

  async function toggleReaction(messageId: string, emoji: string) {
    if (!conv?.id) return;
    try {
      const res = await fetch(`/api/conversations/${conv.id}/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        const list = await fetch(`/api/conversations/${conv.id}/messages`).then((r) => r.json());
        setMessages(list);
      }
    } catch {}
    setReactionMenu(null);
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-wpu-black/10 bg-white p-8 text-center text-wpu-gray">
        Loading conversation…
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="rounded-xl border border-wpu-black/10 bg-white p-8 text-center">
        <p className="text-wpu-black-light">Could not start conversation.</p>
        <Link href={`/item/${itemId}`} className="mt-4 inline-block text-wpu-orange hover:underline">
          Back to item
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-wpu-black/10 bg-white shadow-sm">
      {/* Chat header: other user identity (top-left), tappable to profile */}
      <div className="flex items-center gap-3 border-b border-wpu-black/10 px-4 py-3">
        <Link href={`/item/${itemId}`} className="text-sm font-medium text-wpu-orange hover:underline">
          ← Back to item
        </Link>
        <div className="flex flex-1 items-center gap-3 border-l border-wpu-black/10 pl-3">
          <Link href={`/user/${otherUser?.id ?? ""}`} className="flex items-center gap-2 rounded-lg hover:bg-wpu-orange-light/50">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-wpu-black/20 bg-wpu-gray-light">
              {otherUser?.profilePhotoUrl ? (
                <img src={otherUser.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-wpu-black/50">
                  {(otherUser?.name ?? posterName).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="font-semibold text-wpu-black">{otherUser?.name ?? posterName}</span>
          </Link>
        </div>
      </div>
      <p className="border-b border-wpu-black/10 px-4 pb-2 text-sm text-wpu-gray">
        Chat: {itemTitle}
      </p>
      <div className="flex min-h-[300px] max-h-[60vh] flex-col overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-wpu-gray">
            No messages yet. Say hello or send an image!
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`mb-3 flex ${m.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div className="relative max-w-[85%]">
                <div
                  className={`rounded-lg px-3 py-2 ${
                    m.senderId === currentUserId
                      ? "bg-wpu-orange text-white"
                      : "bg-wpu-gray-light text-wpu-black"
                  }`}
                >
                  {m.replyTo && (
                    <div className={`mb-2 border-l-2 pl-2 text-xs ${m.senderId === currentUserId ? "border-white/60 text-white/90" : "border-wpu-black/30 text-wpu-gray"}`}>
                      <p className="font-medium">{m.replyTo.sender.name}</p>
                      {m.replyTo.imageUrl ? (
                        <span className="italic">[Photo]</span>
                      ) : (
                        <span className="line-clamp-2">{m.replyTo.body || "(empty)"}</span>
                      )}
                    </div>
                  )}
                  {m.senderId !== currentUserId && (
                    <p className="text-xs font-medium text-wpu-gray">{m.sender.name}</p>
                  )}
                  {m.imageUrl && (
                    <a href={m.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-1">
                      <img src={m.imageUrl} alt="" className="max-h-48 rounded-lg object-cover" />
                    </a>
                  )}
                  {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}
                  <p className={`mt-1 text-xs ${m.senderId === currentUserId ? "text-white/80" : "text-wpu-gray"}`}>
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {(m.reactions ?? []).map((r) => (
                    <span
                      key={r.id}
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs ${
                        r.userId === currentUserId ? "bg-wpu-orange/20" : "bg-wpu-gray-light"
                      }`}
                    >
                      {r.emoji}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReplyingTo(m)}
                    className="text-wpu-gray hover:text-wpu-black text-xs"
                  >
                    Reply
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setReactionMenu(reactionMenu === m.id ? null : m.id)}
                      className="text-wpu-gray hover:text-wpu-black text-sm"
                    >
                      ＋
                    </button>
                    {reactionMenu === m.id && (
                      <div className="absolute left-0 bottom-full mb-1 flex gap-1 rounded-lg border border-wpu-black/20 bg-wpu-gray-light p-1 shadow">
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => toggleReaction(m.id, emoji)}
                            className="p-1 text-lg hover:bg-wpu-orange-light/50 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-wpu-black/10 p-4">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-wpu-black/20 bg-wpu-gray-light px-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-wpu-black">Replying to {replyingTo.sender.name}</p>
              <p className="truncate text-wpu-gray">{replyingTo.body || (replyingTo.imageUrl ? "[Photo]" : "")}</p>
            </div>
            <button type="button" onClick={() => setReplyingTo(null)} className="shrink-0 text-wpu-gray hover:text-wpu-black">✕</button>
          </div>
        )}
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploadingImage}
            className="shrink-0 rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black hover:bg-wpu-orange-light disabled:opacity-50"
            title="Upload image"
          >
            📁
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={sending || uploadingImage}
            className="shrink-0 rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black hover:bg-wpu-orange-light disabled:opacity-50"
            title="Take photo"
          >
            {uploadingImage ? "…" : "📷"}
          </button>
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 rounded-lg border border-wpu-black/20 bg-white px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
          <button
            type="submit"
            disabled={(!body.trim() && !uploadingImage) || sending}
            className="rounded-lg bg-wpu-orange px-4 py-2 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
