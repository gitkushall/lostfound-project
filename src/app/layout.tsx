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
        <Nav isLoggedIn={!!user} userId={user?.id ?? null} />
        <main className="min-h-screen bg-white pt-16 pb-20 md:pb-8">{children}</main>
      </body>
    </html>
  );
}
