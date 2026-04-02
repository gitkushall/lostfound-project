import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import { authOptions } from "@/lib/auth";
import { Nav } from "@/components/Nav";

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
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="antialiased bg-white text-wpu-black font-sans">
        <Nav isLoggedIn={!!session} userId={session?.user?.id ?? null} />
        <main className="min-h-screen bg-white pt-16 pb-20 md:pb-8">{children}</main>
      </body>
    </html>
  );
}
