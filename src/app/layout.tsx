import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "LostFound — Campus Lost & Found",
  description: "Report, search, and claim lost items on campus.",
};

// Avoid prerendering with SessionProvider (next-auth) which uses hooks
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-wpu-black font-sans">
        <Providers>
          <Nav />
          <main className="min-h-screen bg-white pt-16 pb-20 md:pb-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
