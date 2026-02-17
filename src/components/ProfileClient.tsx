"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  createdAt?: string;
};

export function ProfileClient({
  name: initialName,
  email: initialEmail,
}: {
  name: string;
  email: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name ?? initialName);
        setBio(data.bio ?? "");
        setProfilePhotoUrl(data.profilePhotoUrl ?? null);
      })
      .catch(() => setError("Failed to load profile"));
  }, [initialName]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoFile(file);
    setProfilePhotoUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let finalPhotoUrl: string | null = profilePhotoUrl;
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("type", "profile");
        const up = await fetch("/api/upload", { method: "POST", body: formData });
        const upData = await up.json();
        if (up.ok) finalPhotoUrl = upData.url;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || null,
          profilePhotoUrl: finalPhotoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.name?.[0] || "Failed to update");
        setSaving(false);
        return;
      }
      setProfile(data);
      setPhotoFile(null);
      setSaving(false);
    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  }

  if (!profile && !error) {
    return (
      <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 text-center text-wpu-black/70">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-wpu-black">Profile</h1>
      <p className="mt-1 text-sm text-wpu-black/70">
        Update your photo and personal information.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-wpu-black">
            Profile photo
          </label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-wpu-black/10 bg-wpu-gray-light">
              {(profilePhotoUrl || profile?.profilePhotoUrl) ? (
                <img
                  src={profilePhotoUrl || profile?.profilePhotoUrl || ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-wpu-black/70">
                  <span className="text-2xl font-semibold text-wpu-black/50">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="block text-sm text-wpu-black file:rounded-lg file:border-0 file:bg-wpu-orange file:px-4 file:py-2 file:text-wpu-black file:hover:bg-wpu-orange-hover"
              />
              <p className="mt-1 text-xs text-wpu-black/70">
                Upload from device or take a photo.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-wpu-black">
            Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-wpu-black/70">Email</label>
          <p className="mt-1 text-wpu-black-light">{profile?.email ?? initialEmail}</p>
          <p className="text-xs text-wpu-black/70">Email cannot be changed.</p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-wpu-black">
            Bio / About you
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
            placeholder="A short description about yourself (optional)"
          />
          <p className="mt-1 text-xs text-wpu-black/70">{bio.length}/500</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-wpu-orange px-4 py-2 font-medium text-wpu-black hover:bg-wpu-orange-hover disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
            className="rounded-lg border border-wpu-black/20 bg-white px-4 py-2 font-medium text-wpu-black hover:bg-wpu-gray-light"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
