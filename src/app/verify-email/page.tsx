"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
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
        <h1 className="text-xl font-bold text-wpu-black">Email verified</h1>
        <p className="mt-2 text-wpu-black-light">
          Your account is now active. You can log in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-wpu-orange px-4 py-2 font-medium text-white hover:bg-wpu-orange-hover"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-wpu-black">Verify your email</h1>
        <p className="mt-1 text-sm text-wpu-black-light">
          LostFound @ WPUNJ — Enter the code we sent to your email.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-wpu-black">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-wpu-black">
            Verification code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            placeholder="000000"
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-wpu-orange py-2.5 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-wpu-black-light">
        <Link href="/login" className="font-medium text-wpu-orange hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <Suspense fallback={<div className="rounded-2xl border bg-white p-8">Loading…</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
