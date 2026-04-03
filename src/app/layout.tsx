import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getValidatedSessionUser } from "@/lib/session-user";

export const metadata: Metadata = {
  title: "LostFound — Campus Lost & Found",
  description: "Report, search, and claim lost items on campus.",
};

// Avoid prerendering with SessionProvider (next-auth) which uses hooks
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getValidatedSessionUser();

  return (
    <html lang="en">
      <body className="antialiased bg-white text-wpu-black font-sans">
        <Nav
          isLoggedIn={!!user}
          userId={user?.id ?? null}
          userName={user?.name ?? null}
          userProfilePhotoUrl={user?.profilePhotoUrl ?? null}
        />
        <main className="min-h-screen bg-white pt-[calc(4.5rem+max(env(safe-area-inset-top),0.75rem))] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pt-16 md:pb-8">{children}</main>
      </body>
    </html>
  );
}
