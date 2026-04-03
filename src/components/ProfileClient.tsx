"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "next-auth/react";
import { getErrorMessage } from "@/lib/client-errors";
import { AppErrorState } from "./AppErrorState";
import { MyPostsClient } from "./MyPostsClient";

type Profile = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  createdAt: string;
  stats: {
    postsCount: number;
    returnedCount: number;
  };
  posts: Array<{
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
      requester: { id: string; name: string };
    }>;
  }>;
};

export function ProfileClient({
  name: initialName,
  email: initialEmail,
}: {
  name: string;
  email: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "posts">("profile");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (!response.ok || data?.error) {
        throw new Error(getErrorMessage(data, "Couldn't load your profile right now."));
      }
      setProfile(data);
      setName(data.name ?? initialName);
      setBio(data.bio ?? "");
      setProfilePhotoUrl(data.profilePhotoUrl ?? null);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Couldn't load your profile right now."));
    } finally {
      setLoading(false);
    }
  }, [initialName]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

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
        if (!up.ok) {
          setError(getErrorMessage(upData, "Photo upload failed."));
          setSaving(false);
          return;
        }
        finalPhotoUrl = upData.url;
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
        setError(getErrorMessage(data, "Couldn't save your profile changes."));
        setSaving(false);
        return;
      }
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...data,
            }
          : data
      );
      setPhotoFile(null);
      setEditing(false);
      setSaving(false);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Couldn't save your profile changes."));
      setSaving(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 text-center text-wpu-black/70">
        Loading profile…
      </div>
    );
  }

  if (!profile && error) {
    return (
      <AppErrorState
        title="Profile unavailable"
        message={error}
        actionLabel="Try again"
        onAction={() => {
          void loadProfile();
        }}
      />
    );
  }

  const joinedDate = new Date(profile?.createdAt ?? Date.now()).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
  const displayBio = profile?.bio?.trim() || "No bio yet.";
  const displayPhotoUrl = profilePhotoUrl || profile?.profilePhotoUrl || null;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-wpu-black/10 bg-white shadow-sm">
        <div className="bg-wpu-orange/8 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white bg-wpu-gray-light shadow-sm">
                {displayPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayPhotoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-wpu-black/70">
                    <span className="text-3xl font-semibold text-wpu-black/50">
                      {(profile?.name ?? name).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-wpu-black">{profile?.name}</h1>
                <p className="mt-1 text-sm text-wpu-black/70">{displayBio}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-wpu-black/45">
                  Joined {joinedDate}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setEditing((current) => !current);
                }}
                className="min-h-[44px] rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover"
              >
                {editing ? "Close" : "Edit Profile"}
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
                className="min-h-[44px] rounded-lg border border-wpu-black/20 bg-white px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
              >
                Log out
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-wpu-black/45">Posts</p>
              <p className="mt-2 text-2xl font-bold text-wpu-black">{profile?.stats.postsCount ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-wpu-black/45">Returned</p>
              <p className="mt-2 text-2xl font-bold text-wpu-black">{profile?.stats.returnedCount ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-wpu-black/10 px-6 sm:px-8">
          <div className="flex gap-6">
            {([
              { id: "profile", label: "Profile" },
              { id: "posts", label: "My Posts" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "profile") setEditing(false);
                }}
                className={`border-b-2 px-1 py-4 text-sm font-semibold ${
                  activeTab === tab.id
                    ? "border-wpu-orange text-wpu-orange"
                    : "border-transparent text-wpu-black/60 hover:text-wpu-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeTab === "profile" ? (
        <section className="space-y-4">
          {editing ? (
            <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-wpu-black">
                    Profile photo
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-wpu-black/10 bg-wpu-gray-light">
                      {displayPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={displayPhotoUrl}
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileChange}
                      className="block text-sm text-wpu-black file:rounded-lg file:border-0 file:bg-wpu-orange file:px-4 file:py-2 file:text-white file:hover:bg-wpu-orange-hover"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-wpu-black">
                    Name
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
                  <label htmlFor="bio" className="block text-sm font-medium text-wpu-black">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
                    placeholder="A short bio"
                  />
                  <p className="mt-1 text-xs text-wpu-black/55">{bio.length}/500</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-[44px] rounded-lg bg-wpu-orange px-4 py-2 text-sm font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(profile?.name ?? initialName);
                      setBio(profile?.bio ?? "");
                      setPhotoFile(null);
                      setProfilePhotoUrl(profile?.profilePhotoUrl ?? null);
                      setError(null);
                    }}
                    className="min-h-[44px] rounded-lg border border-wpu-black/20 bg-white px-4 py-2 text-sm font-medium text-wpu-black hover:bg-wpu-gray-light"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-wpu-black/45">Email</p>
              <p className="mt-2 text-sm text-wpu-black">{profile?.email ?? initialEmail}</p>
            </div>
            <div className="rounded-2xl border border-wpu-black/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-wpu-black/45">About</p>
              <p className="mt-2 text-sm text-wpu-black/75">{displayBio}</p>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <MyPostsClient items={profile?.posts ?? []} />
        </section>
      )}
    </div>
  );
}
