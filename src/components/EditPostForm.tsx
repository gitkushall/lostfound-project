"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
};

export function EditPostForm({
  item,
  categories,
}: {
  item: Item;
  categories: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState(item.category);
  const [locationText, setLocationText] = useState(item.locationText);
  const [dateOccurred, setDateOccurred] = useState(
    new Date(item.dateOccurred).toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState(item.description || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(item.photoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(item.status);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let finalPhotoUrl: string | null = photoUrl;
      if (photoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("type", "item");
        const up = await fetch("/api/upload", { method: "POST", body: formData });
        const upData = await up.json();
        if (!up.ok) {
          setError(upData.error || "Photo upload failed");
          setLoading(false);
          setUploading(false);
          return;
        }
        finalPhotoUrl = upData.url;
        setUploading(false);
      }
      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          locationText,
          dateOccurred: new Date(dateOccurred).toISOString(),
          description: description || undefined,
          photoUrl: finalPhotoUrl ?? undefined,
          status,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.title?.[0] || "Failed to update");
        setLoading(false);
        return;
      }
      router.push(`/item/${item.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <p className="text-sm text-wpu-gray">Type: {item.type}</p>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-wpu-black">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-wpu-black">
          Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-wpu-black">
          Location *
        </label>
        <input
          id="location"
          type="text"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        />
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-wpu-black">
          Date / time *
        </label>
        <input
          id="date"
          type="datetime-local"
          value={dateOccurred}
          onChange={(e) => setDateOccurred(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-wpu-black">Photo</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="rounded-lg border border-wpu-black/20 bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover">
            Take photo
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-wpu-black/20 px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light">
            Upload from device
          </button>
        </div>
        {photoUrl && (
          <div className="mt-3 relative inline-block">
            <img
              src={photoUrl}
              alt="Preview"
              className="h-40 w-auto rounded-lg border border-wpu-black/10 object-cover"
            />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute right-2 top-2 rounded-full bg-wpu-black/70 px-2 py-1 text-xs text-wpu-black hover:bg-wpu-black"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-wpu-black">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-wpu-black">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
        >
          <option value="OPEN">Open</option>
          <option value="PENDING">Pending</option>
          <option value="RETURNED">Returned</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="rounded-lg bg-wpu-orange px-4 py-2 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
        >
          {loading || uploading ? "Saving…" : "Save"}
        </button>
        <Link
          href={`/item/${item.id}`}
          className="rounded-lg border border-wpu-black/20 px-4 py-2 font-medium text-wpu-black hover:bg-wpu-gray-light"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
