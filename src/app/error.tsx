"use client";

import { useEffect } from "react";
import { AppErrorState } from "@/components/AppErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <AppErrorState
        message="The page hit a problem. Try again, or go back and keep using the app."
        actionLabel="Try again"
        onAction={reset}
      />
    </div>
  );
}
