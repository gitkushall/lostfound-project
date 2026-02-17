"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ItemCard } from "./ItemCard";

type Tab = "all" | "LOST" | "FOUND";

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
  createdAt: string;
  postedBy: { id: string; name: string };
};

export function HomeFeed() {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [searchSubmit, setSearchSubmit] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("type", tab);
    if (searchSubmit) params.set("search", searchSubmit);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    params.set("sort", "newest");
    fetch(`/api/items?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab, searchSubmit, category, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchSubmit(search)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-slate-900 placeholder-slate-400 focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
          <button
            type="button"
            onClick={() => setSearchSubmit(search)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm font-medium text-wpu-orange hover:bg-wpu-orange-light"
          >
            Search
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Filters
        </button>
      </div>

      {filterOpen && (
        <div className="rounded-xl border border-slate-300 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-900">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. keys, wallet"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="">Any</option>
                <option value="OPEN">Open</option>
                <option value="PENDING">Pending</option>
                <option value="RETURNED">Returned</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-slate-200">
        {(["all", "LOST", "FOUND"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-wpu-orange text-wpu-orange"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t === "all" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-wpu-orange border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/post"
            className="overflow-hidden rounded-xl border-2 border-dashed border-wpu-orange/40 bg-white shadow-sm transition-shadow hover:border-wpu-orange/60 hover:shadow-md"
          >
            <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 bg-wpu-orange/5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-wpu-orange/20 text-2xl font-bold text-wpu-orange">+</span>
              <span className="text-sm font-medium text-wpu-black">New Post</span>
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-wpu-black">Post Lost or Found Item</h2>
              <p className="mt-1 text-sm text-wpu-black-light">Create a new listing</p>
            </div>
          </Link>
          {items.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-2 flex items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500">
              <p className="w-full">No items match your filters. Try adjusting or post a new item.</p>
            </div>
          ) : (
            items.map((item) => (
              <Link key={item.id} href={`/item/${item.id}`}>
                <ItemCard item={item} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
