"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ITEM_STATUS_LABELS } from "@/lib/item-options";
import { StatusBadge } from "./StatusBadge";
import { getErrorMessage } from "@/lib/client-errors";

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
  const [displayStatus, setDisplayStatus] = useState(item.status);
  const [displayClaimRequests, setDisplayClaimRequests] = useState(item.claimRequests);
  const [displayInfoUpdates, setDisplayInfoUpdates] = useState(item.infoUpdates ?? []);

  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoSubmitting, setInfoSubmitting] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const currentStatusLabel =
    ITEM_STATUS_LABELS[(displayStatus in ITEM_STATUS_LABELS ? displayStatus : "OPEN") as keyof typeof ITEM_STATUS_LABELS];
  const statusSummary =
    displayStatus === "OPEN"
      ? "Open for claims or leads."
      : displayStatus === "CLAIM_PENDING"
        ? "Claim under review."
        : displayStatus === "CLAIMED"
          ? "Claim accepted."
          : "Marked returned.";

  useEffect(() => {
    setDisplayStatus(item.status);
    setDisplayClaimRequests(item.claimRequests);
    setDisplayInfoUpdates(item.infoUpdates ?? []);
  }, [item]);

  async function handleDelete() {
    if (!confirm("Remove this post from the public feed? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        router.push("/my-posts");
      } else {
        alert(getErrorMessage(data, "Couldn't delete this post."));
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Couldn't delete this post."));
    } finally {
      setDeleting(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaimError(null);
    setClaimSuccess(null);
    setClaiming(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, message: claimMessage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(getErrorMessage(data, "Couldn't submit your claim."));
        setClaiming(false);
        return;
      }
      setDisplayStatus("CLAIM_PENDING");
      setClaimSuccess("Claim request sent. The poster has been notified.");
      setClaiming(false);
      setClaimMessage("");
      router.refresh();
    } catch (error: unknown) {
      setClaimError(getErrorMessage(error, "Couldn't submit your claim."));
      setClaiming(false);
    }
  }

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoError(null);
    setInfoSubmitting(true);
    try {
      const res = await fetch("/api/item-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, message: infoMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoError(getErrorMessage(data, "Couldn't submit that information."));
        setInfoSubmitting(false);
        return;
      }
      setDisplayInfoUpdates((prev) => [
        ...prev,
        {
          id: data.id,
          type: data.type,
          message: data.message,
          createdAt: data.createdAt,
          user: data.user,
        },
      ]);
      router.refresh();
      setInfoMessage("");
      setInfoSubmitting(false);
    } catch (error: unknown) {
      setInfoError(getErrorMessage(error, "Couldn't submit that information."));
      setInfoSubmitting(false);
    }
  }

  async function handleApproveDeny(claimId: string, status: "APPROVED" | "DENIED") {
    setStatusError(null);
    setStatusSuccess(null);
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(getErrorMessage(data, "Couldn't update this claim."));
        return;
      }
      const nextClaimRequests = displayClaimRequests.map((claim) => {
        if (claim.id === claimId) {
          return { ...claim, status };
        }
        if (status === "APPROVED" && claim.status === "PENDING") {
          return { ...claim, status: "DENIED" };
        }
        return claim;
      });

      setDisplayClaimRequests(nextClaimRequests);
      setDisplayStatus(
        status === "APPROVED"
          ? "CLAIMED"
          : nextClaimRequests.some((claim) => claim.status === "PENDING")
            ? "CLAIM_PENDING"
            : "OPEN"
      );
      setStatusSuccess(
        status === "APPROVED" ? "Claim approved successfully." : "Claim denied."
      );
      router.refresh();
    } catch (error: unknown) {
      setStatusError(getErrorMessage(error, "Couldn't update this claim."));
    }
  }

  async function handleStatusUpdate(status: "CLAIMED" | "RETURNED") {
    setStatusError(null);
    setStatusSuccess(null);
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(getErrorMessage(data, "Couldn't update the post status."));
        return;
      }
      setDisplayStatus(data.status ?? status);
      setStatusSuccess(`Status updated to ${ITEM_STATUS_LABELS[status]}.`);
      router.refresh();
    } catch (error: unknown) {
      setStatusError(getErrorMessage(error, "Couldn't update the post status."));
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-wpu-orange hover:underline">
        ← Back to feed
      </Link>

      <div className="overflow-hidden rounded-2xl border border-wpu-black/10 bg-white shadow-sm">
        <div className="aspect-video bg-wpu-gray-light">
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={item.title}
              width={1280}
              height={720}
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
            <StatusBadge status={displayStatus} />
            <span className="rounded-full bg-wpu-gray-light px-2.5 py-0.5 text-xs text-wpu-black-light">
              {item.category}
            </span>
          </div>
          <h1 className="break-words text-2xl font-bold text-wpu-black">{item.title}</h1>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-wpu-gray-light/80 px-4 py-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-wpu-black/55">Status</p>
              <div className="mt-2">
                <StatusBadge status={displayStatus} />
              </div>
            </div>
            <p className="text-sm text-wpu-black/65">{statusSummary}</p>
          </div>
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
          <div className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href={`/item/${item.id}/edit`}
              className="min-h-[44px] rounded-lg bg-wpu-orange px-4 py-2 text-center text-sm font-medium text-white hover:bg-wpu-orange-hover"
            >
              Edit
            </Link>
            <Link
              href="/notifications"
              className="min-h-[44px] rounded-lg border border-wpu-black/20 px-4 py-2 text-center text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
            >
              Inbox
            </Link>
            <Link
              href="/my-posts"
              className="min-h-[44px] rounded-lg border border-wpu-black/20 px-4 py-2 text-center text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
            >
              My Posts
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="min-h-[44px] rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Removing…" : "Delete post"}
            </button>
          </div>
          <p className="mt-3 text-sm text-wpu-black/60">New messages appear in Inbox.</p>
          {displayStatus !== "RETURNED" && (
            <div className="mt-4 rounded-2xl border border-wpu-black/10 bg-wpu-gray-light/70 p-4">
              <p className="text-sm font-semibold text-wpu-black">Update status</p>
              <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
                {displayStatus !== "CLAIMED" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("CLAIMED")}
                    disabled={statusUpdating}
                    className="min-h-[44px] rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                  >
                    Mark as {ITEM_STATUS_LABELS.CLAIMED}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("RETURNED")}
                  disabled={statusUpdating}
                  className="min-h-[44px] rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Mark as {ITEM_STATUS_LABELS.RETURNED}
                </button>
              </div>
              {statusError && <p className="mt-3 text-sm text-red-600">{statusError}</p>}
              {statusSuccess && (
                <p className="mt-3 text-sm text-emerald-700" role="status">
                  {statusSuccess}
                </p>
              )}
            </div>
          )}
          {isFound && displayClaimRequests.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-wpu-black">Claims</h3>
              <ul className="mt-2 space-y-3">
                {displayClaimRequests.map((cr) => (
                  <li
                    key={cr.id}
                    className="flex flex-col gap-3 rounded-lg border border-wpu-black/10 bg-wpu-gray-light p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-wpu-black">{cr.requester.name}</p>
                      {cr.message && (
                        <p className="break-words text-sm text-wpu-black-light">{cr.message}</p>
                      )}
                      <span className="text-xs text-wpu-black/70">{cr.status}</span>
                    </div>
                    {cr.status === "PENDING" && (
                      <div className="grid gap-2 sm:flex sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveDeny(cr.id, "APPROVED")}
                          className="min-h-[44px] rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveDeny(cr.id, "DENIED")}
                          className="min-h-[44px] rounded border border-wpu-black/10 bg-white px-3 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-black/10"
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
          {isLost && displayInfoUpdates.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-wpu-black">Updates</h3>
              <ul className="mt-2 space-y-3">
                {displayInfoUpdates.map((info) => (
                  <li
                    key={info.id}
                    className="rounded-lg border border-wpu-black/10 bg-wpu-gray-light p-3"
                  >
                    <p className="font-medium text-wpu-black">{info.user.name}</p>
                    {info.message && (
                      <p className="mt-1 text-sm text-wpu-black/70">{info.message}</p>
                    )}
                    {!info.message && (
                      <p className="mt-1 text-sm text-wpu-black/70">Shared info</p>
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
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
            >
              Message poster
            </Link>
          </div>

          {/* FOUND: Claim option only */}
          {isFound && (
            <div className="rounded-xl border border-wpu-black/10 bg-white p-6">
              <h2 className="font-semibold text-wpu-black">Claim item</h2>
              {displayStatus !== "OPEN" ? (
                <p className="mt-1 text-sm text-wpu-black-light">
                  Unavailable while marked {currentStatusLabel.toLowerCase()}.
                </p>
              ) : null}
              <form onSubmit={handleClaim} className="mt-4 space-y-3">
                <textarea
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  placeholder="Add note"
                  rows={3}
                  disabled={displayStatus !== "OPEN"}
                  className="w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange disabled:cursor-not-allowed disabled:bg-wpu-gray-light/70"
                />
                {claimError && (
                  <p className="text-sm text-red-600">{claimError}</p>
                )}
                {claimSuccess && (
                  <p className="text-sm text-emerald-700" role="status">
                    {claimSuccess}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={claiming || displayStatus !== "OPEN"}
                  className="min-h-[44px] w-full rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50 sm:w-auto"
                >
                  {claiming ? "Sending…" : "Send claim"}
                </button>
              </form>
            </div>
          )}

          {/* LOST: Information options only (no claim) */}
          {isLost && displayStatus !== "RETURNED" && (
            <div className="rounded-xl border border-wpu-black/10 bg-white p-6">
              <h2 className="font-semibold text-wpu-black">Share info</h2>
              <form onSubmit={handleInfoSubmit} className="mt-4 space-y-3">
                <textarea
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="Add note"
                  rows={2}
                  className="w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
                />
                {infoError && (
                  <p className="text-sm text-red-600">{infoError}</p>
                )}
                <button
                  type="submit"
                  disabled={!infoMessage.trim() || infoSubmitting}
                  className="min-h-[44px] w-full rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50 sm:w-auto"
                >
                  {infoSubmitting ? "Sending…" : "Send update"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
