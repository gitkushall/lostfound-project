"use client";

import { AppErrorState } from "@/components/AppErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body className="bg-white font-sans text-wpu-black antialiased">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-10">
          <AppErrorState
            message="The app hit an unexpected error. Try loading it again."
            actionLabel="Reload"
            onAction={reset}
          />
        </main>
      </body>
    </html>
  );
}
