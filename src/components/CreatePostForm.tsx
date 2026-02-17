"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function CreatePostForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<"LOST" | "FOUND">("LOST");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [locationText, setLocationText] = useState("");
  const [dateOccurred, setDateOccurred] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError({ _: ["Please choose an image file (JPEG, PNG, WebP, GIF)."] });
      return;
    }
    setError(null);
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
      let finalPhotoUrl: string | undefined;
      if (photoFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("type", "item");
        const up = await fetch("/api/upload", { method: "POST", body: formData });
        const upData = await up.json();
        if (!up.ok) {
          setError({ _: [upData.error || "Photo upload failed"] });
          setLoading(false);
          setUploading(false);
          return;
        }
        finalPhotoUrl = upData.url;
        setUploading(false);
      }
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          category,
          locationText,
          dateOccurred: new Date(dateOccurred).toISOString(),
          description: description || undefined,
          photoUrl: finalPhotoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || { _: ["Failed to create post"] });
        setLoading(false);
        return;
      }
      router.push(`/item/${data.id}`);
      router.refresh();
    } catch {
      setError({ _: ["Something went wrong."] });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-wpu-black">Type</label>
        <div className="mt-2 flex gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="LOST"
              checked={type === "LOST"}
              onChange={() => setType("LOST")}
              className="text-wpu-orange focus:ring-wpu-orange"
            />
            Lost
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="FOUND"
              checked={type === "FOUND"}
              onChange={() => setType("FOUND")}
              className="text-wpu-orange focus:ring-wpu-orange"
            />
            Found
          </label>
        </div>
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
          placeholder="e.g. Black Wallet"
        />
        {error?.title && <p className="mt-1 text-sm text-red-600">{error.title[0]}</p>}
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
          <option value="">Select category</option>
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
          placeholder="Where lost / where found"
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
        <label className="block text-sm font-medium text-wpu-black">
          Photo (optional)
        </label>
        <p className="mt-1 text-xs text-wpu-black/70">
          Take a photo with your camera or upload from device.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg border border-wpu-black/20 bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
          >
            Take photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-wpu-black/20 px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
          >
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
          placeholder="Additional details..."
        />
      </div>

      {error?._ && <p className="text-sm text-red-600">{error._[0]}</p>}

      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full rounded-lg bg-wpu-orange py-2.5 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
      >
        {loading || uploading ? "Creating…" : "Create post"}
      </button>
    </form>
  );
}
