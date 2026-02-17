"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/my-posts", label: "My Posts" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

const menuLinks = [
  { href: "/about", label: "About the App" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/rules", label: "Rules & Safety Tips" },
  { href: "/contact", label: "Contact Information" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/notifications/count")
      .then((r) => r.json())
      .then((data) => setNotificationCount(data.count ?? 0))
      .catch(() => {});
  }, [session?.user?.id, pathname]);

  useEffect(() => {
    if (pathname === "/notifications" && session?.user?.id) {
      fetch("/api/notifications/read-all", { method: "PATCH" }).then(() => {
        setNotificationCount(0);
      });
    }
  }, [pathname, session?.user?.id]);

  const isLoggedIn = !!session;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-nowrap" style={{ height: "calc(4rem + 0.5cm)" }}>
      {/* Logo area (left): square, yellow background – University logo, links to Home */}
      <Link
        href="/"
        className="flex h-full w-[calc(5rem+1.25cm)] shrink-0 items-center justify-center border-r border-black/20 bg-wpu-orange p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black/20"
        aria-label="William Paterson University - Go to Home"
      >
        <Image
          src="/wpStackedBlack.png"
          alt="William Paterson University"
          width={120}
          height={120}
          className="h-[calc(4rem+0.25cm)] w-auto object-contain"
          priority
        />
      </Link>

      {/* Black area: LostFound (dropdown) + main nav */}
      <div className="flex flex-1 items-center justify-between gap-4 bg-black px-4">
        <div className="relative flex min-w-0 shrink items-center gap-4" ref={menuRef}>
          {/* LostFound – no icon, click opens dropdown */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="shrink-0 text-base font-semibold text-white hover:text-wpu-orange focus:outline-none focus:ring-0"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="LostFound menu"
          >
            LostFound
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full z-[100] mt-1 w-56 rounded-md border border-white/20 bg-zinc-800 py-2 shadow-xl">
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-wpu-orange/30 hover:text-wpu-orange"
              >
                About the App
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-wpu-orange/30 hover:text-wpu-orange"
              >
                How It Works
              </Link>
              <Link
                href="/rules"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-wpu-orange/30 hover:text-wpu-orange"
              >
                Rules &amp; Safety Tips
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-white hover:bg-wpu-orange/30 hover:text-wpu-orange"
              >
                Contact Information
              </Link>
            </div>
          )}
        </div>

        {/* Main nav: when logged in = Home, Post, My Posts, Profile; when not = Home, Login, Sign up */}
        <div className="flex shrink-0 items-center gap-1 md:gap-2">
          {isLoggedIn ? (
            mainLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3 ${
                    isActive ? "text-wpu-orange" : "text-white hover:text-wpu-orange"
                  }`}
                >
                  {label}
                  {href === "/notifications" && notificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wpu-orange px-1.5 text-xs font-bold text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href="/"
                className={`whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3 ${
                  pathname === "/" ? "text-wpu-orange" : "text-white hover:text-wpu-orange"
                }`}
              >
                Home
              </Link>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-white transition-colors hover:text-wpu-orange sm:px-3"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium text-white transition-colors hover:text-wpu-orange sm:px-3"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
