"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!token) {
      setError("Invalid reset link");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-wpu-black">Password reset</h1>
        <p className="mt-2 text-wpu-black-light">Your password has been updated. You can now log in.</p>
        <Link href="/login" className="mt-6 inline-block rounded-lg bg-wpu-orange px-4 py-2 font-medium text-white hover:bg-wpu-orange-hover">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-wpu-black">Set new password</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-wpu-black">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-wpu-black">Confirm password</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-wpu-orange py-2.5 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <Suspense fallback={<div className="rounded-2xl border border-wpu-black/10 bg-white p-8 text-wpu-black">Loading…</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
