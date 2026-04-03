"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ItemCard } from "./ItemCard";
import { ITEM_CATEGORIES, ITEM_STATUSES, ITEM_STATUS_LABELS } from "@/lib/item-options";

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

type HomeFeedProps = {
  showCreateCard?: boolean;
};

export function HomeFeed({ showCreateCard = true }: HomeFeedProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);

  const deferredSearch = useDeferredValue(searchValue.trim());
  const hasActiveFilters = Boolean(tab !== "all" || deferredSearch || category || location || status);

  const params = useMemo(() => {
    const nextParams = new URLSearchParams();
    if (tab !== "all") nextParams.set("type", tab);
    if (deferredSearch) nextParams.set("search", deferredSearch);
    if (category) nextParams.set("category", category);
    if (location.trim()) nextParams.set("location", location.trim());
    if (status) nextParams.set("status", status);
    nextParams.set("sort", "newest");
    return nextParams.toString();
  }, [tab, deferredSearch, category, location, status]);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetch(`/api/items?${params}`)
      .then((response) => response.json())
      .then((data) => {
        if (isCancelled) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isCancelled) return;
        setItems([]);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [params]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }

    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  function applySearch() {
    setSearchValue(search);
  }

  function clearFilters() {
    setTab("all");
    setSearch("");
    setSearchValue("");
    setCategory("");
    setLocation("");
    setStatus("");
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch();
            }}
            placeholder="Search items..."
            className="w-full rounded-2xl border-2 border-wpu-orange/90 bg-white px-5 py-3 pr-28 text-base text-wpu-black placeholder:text-slate-400 focus:border-wpu-orange focus:outline-none"
          />
          <button
            type="button"
            onClick={applySearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 py-1.5 text-sm font-semibold text-wpu-orange hover:bg-wpu-orange/10"
          >
            Search
          </button>
        </div>

        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((current) => !current)}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Filters
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="space-y-3">
                <div>
                  <label htmlFor="feed-category" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Category
                  </label>
                  <select
                    id="feed-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-wpu-orange focus:outline-none"
                  >
                    <option value="">All</option>
                    {ITEM_CATEGORIES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="feed-status" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Status
                  </label>
                  <select
                    id="feed-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-wpu-orange focus:outline-none"
                  >
                    <option value="">All</option>
                    {ITEM_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {ITEM_STATUS_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="feed-location" className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Location
                  </label>
                  <input
                    id="feed-location"
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Optional"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-wpu-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="rounded-full bg-wpu-orange px-4 py-2 text-sm font-semibold text-white hover:bg-wpu-orange-hover"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6 border-b border-slate-200">
        {([
          { value: "all", label: "All" },
          { value: "LOST", label: "Lost" },
          { value: "FOUND", label: "Found" },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTab(option.value)}
            className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
              tab === option.value
                ? "border-wpu-orange text-wpu-orange"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-wpu-orange border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showCreateCard && (
            <Link
              href="/post"
              className="overflow-hidden rounded-xl border-2 border-dashed border-wpu-orange/35 bg-white shadow-sm transition-shadow hover:border-wpu-orange/60 hover:shadow-md"
            >
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-wpu-orange/5">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-wpu-orange/20 text-2xl font-bold text-wpu-orange">
                  +
                </span>
                <span className="text-sm font-medium text-wpu-black">New Post</span>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-wpu-black">Post Lost or Found Item</h2>
                <p className="mt-1 text-sm text-wpu-black-light">Create a new listing</p>
              </div>
            </Link>
          )}

          {items.length === 0 ? (
            <div className="flex items-center rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-2">
              <p className="w-full">No matching items found.</p>
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
    </section>
  );
}
