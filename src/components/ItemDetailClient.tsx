"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  locationText: string;
  dateOccurred: string;
  photoUrl: string | null;
  status: string;
  postedByUserId: string;
  postedBy: { id: string; name: string };
  claimRequests: Array<{
    id: string;
    message: string | null;
    status: string;
    requester: { id: string; name: string };
  }>;
  infoUpdates?: Array<{
    id: string;
    type: string;
    message: string | null;
    user: { id: string; name: string };
    createdAt: string;
  }>;
};

export function ItemDetailClient({
  item,
  currentUserId,
}: {
  item: Item;
  currentUserId: string;
}) {
  const router = useRouter();
  const isOwner = item.postedByUserId === currentUserId;
  const date = new Date(item.dateOccurred).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isFound = item.type === "FOUND";
  const isLost = item.type === "LOST";

  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [infoType, setInfoType] = useState<"SEEN" | "RETURNED_TO_DESK" | null>(null);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoSubmitting, setInfoSubmitting] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this post from the public feed? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      if (res.ok) router.push("/my-posts");
      else {
        const data = await res.json();
        alert(data.error || "Could not delete");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaimError(null);
    setClaiming(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, message: claimMessage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.error || "Failed to submit claim");
        setClaiming(false);
        return;
      }
      router.refresh();
      setClaiming(false);
      setClaimMessage("");
    } catch {
      setClaimError("Something went wrong");
      setClaiming(false);
    }
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!infoType) return;
    setInfoError(null);
    setInfoSubmitting(true);
    try {
      const res = await fetch("/api/item-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, type: infoType, message: infoMessage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoError(data.error || "Failed to submit");
        setInfoSubmitting(false);
        return;
      }
      router.refresh();
      setInfoType(null);
      setInfoMessage("");
      setInfoSubmitting(false);
    } catch {
      setInfoError("Something went wrong");
      setInfoSubmitting(false);
    }
  }

  async function handleApproveDeny(claimId: string, status: "APPROVED" | "DENIED") {
    try {
      await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {}
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-wpu-orange hover:underline">
        ← Back to feed
      </Link>

      <div className="overflow-hidden rounded-2xl border border-wpu-black/10 bg-white shadow-sm">
        <div className="aspect-video bg-wpu-gray-light">
          {item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-wpu-black/70">
              <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isLost ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {item.type}
            </span>
            <span className="rounded-full bg-wpu-gray-light px-2.5 py-0.5 text-xs font-medium text-wpu-black-light">
              {item.status}
            </span>
            <span className="rounded-full bg-wpu-gray-light px-2.5 py-0.5 text-xs text-wpu-black-light">
              {item.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-wpu-black">{item.title}</h1>
          <p className="mt-2 text-wpu-black-light">{item.locationText} · {date}</p>
          {item.description && (
            <p className="mt-4 text-wpu-black-light">{item.description}</p>
          )}
          <p className="mt-4 text-sm text-wpu-black/70">
            Posted by{" "}
            <Link href={`/user/${item.postedBy.id}`} className="font-medium text-wpu-orange-dark hover:underline">
              {item.postedBy.name}
            </Link>
            {" · "}
            <Link href={`/user/${item.postedBy.id}`} className="text-wpu-orange-dark hover:underline">View profile</Link>
          </p>
        </div>
      </div>

      {isOwner ? (
        <div className="rounded-xl border border-wpu-black/10 bg-white p-6">
          <h2 className="font-semibold text-wpu-black">Your post</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/item/${item.id}/edit`}
              className="rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
            >
              Edit
            </Link>
            <Link
              href={`/item/${item.id}/chat`}
              className="rounded-lg border border-wpu-black/20 px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
            >
              Chat
            </Link>
            <Link
              href="/my-posts"
              className="rounded-lg border border-wpu-black/20 px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
            >
              My Posts
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Delete post"}
            </button>
          </div>
          {isFound && item.claimRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-wpu-black">Claim requests</h3>
              <ul className="mt-2 space-y-3">
                {item.claimRequests.map((cr) => (
                  <li
                    key={cr.id}
                    className="flex items-center justify-between rounded-lg border border-wpu-black/10 bg-wpu-gray-light p-3"
                  >
                    <div>
                      <p className="font-medium text-wpu-black">{cr.requester.name}</p>
                      {cr.message && (
                        <p className="text-sm text-wpu-black-light">{cr.message}</p>
                      )}
                      <span className="text-xs text-wpu-black/70">{cr.status}</span>
                    </div>
                    {cr.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveDeny(cr.id, "APPROVED")}
                          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-wpu-black hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveDeny(cr.id, "DENIED")}
                          className="rounded bg-wpu-gray-light px-3 py-1.5 text-sm font-medium text-wpu-black hover:bg-wpu-black/10"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isLost && item.infoUpdates && item.infoUpdates.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-wpu-black">Information reports</h3>
              <ul className="mt-2 space-y-3">
                {item.infoUpdates.map((info) => (
                  <li
                    key={info.id}
                    className="rounded-lg border border-wpu-black/10 bg-wpu-gray-light p-3"
                  >
                    <p className="font-medium text-wpu-black">{info.user.name}</p>
                    <p className="text-sm text-wpu-black-light">
                      {info.type === "SEEN" ? "I have seen this item" : "Item has been returned to the information desk"}
                    </p>
                    {info.message && (
                      <p className="mt-1 text-sm text-wpu-black/70">{info.message}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Chat link for everyone (poster or not) */}
          <div className="rounded-xl border border-wpu-black/10 bg-white p-4">
            <Link
              href={`/item/${item.id}/chat`}
              className="inline-flex items-center gap-2 rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
            >
              Message poster
            </Link>
          </div>

          {/* FOUND: Claim option only */}
          {isFound && (item.status === "OPEN" || item.status === "PENDING") && (
            <div className="rounded-xl border border-wpu-black/10 bg-white p-6">
              <h2 className="font-semibold text-wpu-black">I think this is mine</h2>
              <p className="mt-1 text-sm text-wpu-black-light">
                Send a claim request. You can describe how you can verify ownership.
              </p>
              <form onSubmit={handleClaim} className="mt-4 space-y-3">
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="e.g. It has a red sticker, contains my ID card..."
                  rows={3}
                  className="w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
                />
                {claimError && (
                  <p className="text-sm text-red-600">{claimError}</p>
                )}
                <button
                  type="submit"
                  disabled={claiming}
                  className="rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
                >
                  {claiming ? "Sending…" : "Request to claim"}
                </button>
              </form>
            </div>
          )}

          {/* LOST: Information options only (no claim) */}
          {isLost && (item.status === "OPEN" || item.status === "PENDING") && (
            <div className="rounded-xl border border-wpu-black/10 bg-white p-6">
              <h2 className="font-semibold text-wpu-black">Have information about this item?</h2>
              <p className="mt-1 text-sm text-wpu-black-light">
                Help the owner by reporting if you have seen this item or if it was returned to the information desk.
              </p>
              <form onSubmit={handleInfoSubmit} className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 text-wpu-black">
                    <input
                      type="radio"
                      name="infoType"
                      checked={infoType === "SEEN"}
                      onChange={() => setInfoType("SEEN")}
                      className="text-wpu-orange focus:ring-wpu-orange"
                    />
                    I have seen this item
                  </label>
                  <label className="inline-flex items-center gap-2 text-wpu-black">
                    <input
                      type="radio"
                      name="infoType"
                      checked={infoType === "RETURNED_TO_DESK"}
                      onChange={() => setInfoType("RETURNED_TO_DESK")}
                      className="text-wpu-orange focus:ring-wpu-orange"
                    />
                    Item has been returned to the information desk
                  </label>
                </div>
                <textarea
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="Optional: add details (e.g. where you saw it)"
                  rows={2}
                  className="w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
                />
                {infoError && (
                  <p className="text-sm text-red-600">{infoError}</p>
                )}
                <button
                  type="submit"
                  disabled={!infoType || infoSubmitting}
                  className="rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
                >
                  {infoSubmitting ? "Sending…" : "Submit information"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
