import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LostFound — Campus Lost & Found",
  description: "Report, search, and claim lost items on campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased bg-white text-wpu-black`}>
        <Providers>
          <Nav />
          <main className="min-h-screen bg-white pt-16 pb-20 md:pb-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
