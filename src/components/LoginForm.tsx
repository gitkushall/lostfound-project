"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(registered ? "Account created. Please log in." : null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-wpu-black/10 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-wpu-black">LostFound</h1>
        <p className="mt-1 text-sm text-wpu-gray">WPUNJ Campus Lost & Found</p>
      </div>
      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
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
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-wpu-black">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-wpu-black/20 px-3 py-2 text-wpu-black placeholder-wpu-gray focus:border-wpu-orange focus:outline-none focus:ring-1 focus:ring-wpu-orange"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-wpu-orange py-2.5 font-medium text-white hover:bg-wpu-orange-hover disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Logging in…
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-wpu-black-light">
        <Link href="/signup" className="font-medium text-wpu-orange hover:underline">
          Create account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-wpu-gray">
        <Link href="/forgot-password" className="hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
