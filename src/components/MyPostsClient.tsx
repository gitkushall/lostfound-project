"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  type: string;
  title: string;
  category: string;
  locationText: string;
  dateOccurred: string;
  photoUrl: string | null;
  status: string;
  claimRequests: Array<{
    id: string;
    status: string;
    requester: { name: string };
  }>;
};

export function MyPostsClient({ items }: { items: Item[] }) {
  const router = useRouter();

  async function updateStatus(itemId: string, status: string) {
    try {
      await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch {}
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Remove this post from the public feed? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error || "Could not delete");
      }
    } catch {
      alert("Could not delete");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-wpu-black/20 bg-wpu-gray-light py-12 text-center text-wpu-black-light">
        You haven’t posted any items yet.{" "}
        <Link href="/post" className="font-medium text-wpu-orange hover:underline">
          Create a post
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-4">
      {items.map((item) => {
        const date = new Date(item.dateOccurred).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const pendingClaims = item.claimRequests.filter((c) => c.status === "PENDING");
        return (
          <li
            key={item.id}
            className="flex flex-col gap-4 rounded-xl border border-wpu-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link href={`/item/${item.id}`} className="flex-1 min-w-0">
              <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-wpu-gray-light">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-wpu-gray">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-wpu-black">{item.title}</p>
                  <p className="text-sm text-wpu-black-light">{item.category} · {item.locationText} · {date}</p>
                  <div className="mt-1 flex gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                        item.type === "LOST" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="rounded-full border border-wpu-black/20 bg-wpu-gray-light px-2 py-1 text-xs font-medium text-wpu-black">
                      {item.status}
                    </span>
                    {pendingClaims.length > 0 && (
                      <span className="rounded-full bg-wpu-orange/30 px-2 py-0.5 text-xs font-medium text-wpu-orange">
                        {pendingClaims.length} claim(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
              <Link
                href={`/item/${item.id}`}
                className="rounded-lg border border-wpu-black/20 px-3 py-1.5 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
              >
                View
              </Link>
              {(item.status === "OPEN" || item.status === "PENDING") && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "RETURNED")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Mark returned
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "CLOSED")}
                    className="rounded-lg bg-wpu-gray-light px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Close
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete post
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
