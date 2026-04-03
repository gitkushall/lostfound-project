"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { getErrorMessage } from "@/lib/client-errors";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/my-posts", label: "My Posts" },
];

const menuLinks = [
  { href: "/about", label: "About the App" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/rules", label: "Rules & Safety Tips" },
  { href: "/contact", label: "Contact Information" },
];

type NavProps = {
  isLoggedIn: boolean;
  userId: string | null;
  userName: string | null;
  userProfilePhotoUrl: string | null;
};

type NavNotification = {
  id: string;
  type: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
};

export function Nav({ isLoggedIn, userId, userName, userProfilePhotoUrl }: NavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NavNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  function formatRelativeTime(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));

    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  function getNotificationSummary(notification: NavNotification) {
    let data: {
      itemTitle?: string;
      requesterName?: string;
      senderName?: string;
      messageBody?: string;
      itemId?: string;
      conversationId?: string;
    } = {};

    try {
      if (notification.data) {
        data = JSON.parse(notification.data);
      }
    } catch {
      // ignore invalid stored payloads
    }

    if (notification.type === "NEW_MESSAGE") {
      return {
        title: data.senderName || "New message",
        description: data.messageBody || data.itemTitle || "Open chat",
        href:
          data.conversationId && data.itemId
            ? `/item/${data.itemId}/chat?conversation=${data.conversationId}`
            : data.itemId
              ? `/item/${data.itemId}`
              : "/notifications",
      };
    }

    if (notification.type === "CLAIM_REQUEST") {
      return {
        title: "Claim request",
        description: data.itemTitle
          ? `${data.requesterName || "Someone"} requested ${data.itemTitle}`
          : "Someone requested your item",
        href: data.itemId ? `/item/${data.itemId}` : "/notifications",
      };
    }

    if (notification.type === "CLAIM_APPROVED") {
      return {
        title: "Claim approved",
        description: data.itemTitle ? data.itemTitle : "Your claim was approved",
        href: data.itemId ? `/item/${data.itemId}` : "/notifications",
      };
    }

    if (notification.type === "ITEM_INFO") {
      return {
        title: "New info",
        description: data.itemTitle || "Someone shared new item information",
        href: data.itemId ? `/item/${data.itemId}` : "/notifications",
      };
    }

    return {
      title: "Activity",
      description: "Open notifications",
      href: "/notifications",
    };
  }

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoadingNotifications(true);
    setNotificationsError(null);
    try {
      const [countResponse, listResponse] = await Promise.all([
        fetch("/api/notifications/count", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);
      const countData = await countResponse.json();
      const listData = await listResponse.json();

      if (!countResponse.ok) {
        throw new Error(getErrorMessage(countData, "Couldn't load activity right now."));
      }
      if (!listResponse.ok) {
        throw new Error(getErrorMessage(listData, "Couldn't load activity right now."));
      }

      setNotificationCount(countData.count ?? 0);
      setRecentNotifications(Array.isArray(listData) ? listData.slice(0, 5) : []);
    } catch (error: unknown) {
      setNotificationsError(getErrorMessage(error, "Couldn't load activity right now."));
    } finally {
      setLoadingNotifications(false);
    }
  }, [userId]);

  async function markNotificationRead(id: string) {
    setNotificationsError(null);
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(getErrorMessage(data, "Couldn't update this notification."));
      }
      setRecentNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (error: unknown) {
      setNotificationsError(getErrorMessage(error, "Couldn't update this notification."));
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (menuOpen || notificationsOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, notificationsOpen]);

  useEffect(() => {
    if (!userId) {
      setNotificationCount(0);
      setRecentNotifications([]);
      setNotificationsOpen(false);
      setNotificationsError(null);
      return;
    }

    loadNotifications();
  }, [userId, pathname, loadNotifications]);

  useEffect(() => {
    if (pathname === "/notifications" && userId) {
      fetch("/api/notifications/read-all", { method: "PATCH" }).then(() => {
        setNotificationCount(0);
        setRecentNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
      });
    }
  }, [pathname, userId]);

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex flex-nowrap" style={{ height: "calc(4rem + 0.5cm)" }}>
      {/* Logo area (left): square, yellow background – University logo, links to Home */}
      <Link
        href="/"
        className="flex h-full w-[4.75rem] shrink-0 items-center justify-center border-r border-black/20 bg-wpu-orange p-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black/20 sm:w-[calc(5rem+1.25cm)]"
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
      <div className="flex flex-1 items-center justify-between gap-2 bg-black px-2 sm:gap-4 sm:px-4">
        <div className="relative flex min-w-0 shrink items-center gap-2 sm:gap-4" ref={menuRef}>
          {/* LostFound – no icon, click opens dropdown */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="min-h-[44px] shrink-0 rounded-lg px-2 text-sm font-semibold text-white hover:text-wpu-orange focus:outline-none focus:ring-0 sm:text-base"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="LostFound menu"
          >
            LostFound
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full z-[100] mt-1 w-[min(18rem,calc(100vw-1rem))] rounded-md border border-white/20 bg-zinc-800 py-2 shadow-xl">
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
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-2">
          {isLoggedIn ? (
            <>
              {mainLinks.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm ${
                      isActive ? "text-wpu-orange" : "text-white hover:text-wpu-orange"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = !notificationsOpen;
                    setNotificationsOpen(nextOpen);
                    if (nextOpen) {
                      loadNotifications();
                    }
                  }}
                  className={`relative min-h-[44px] min-w-[44px] rounded-lg p-2 transition-colors ${
                    pathname === "/notifications" || notificationsOpen
                      ? "text-wpu-orange"
                      : "text-white hover:text-wpu-orange"
                  }`}
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wpu-orange px-1.5 text-[11px] font-bold text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full z-[100] mt-2 w-[min(22rem,calc(100vw-0.75rem))] overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <p className="text-sm font-semibold text-white">Recent activity</p>
                      <Link
                        href="/notifications"
                        className="text-xs font-medium text-wpu-orange hover:text-white"
                      >
                        View all
                      </Link>
                    </div>

                    {loadingNotifications ? (
                      <div className="px-4 py-6 text-center text-sm text-white/70">
                        Loading...
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-white/60">
                        No activity yet
                      </div>
                    ) : (
                      <div className="max-h-[22rem] overflow-y-auto p-2">
                        {notificationsError ? (
                          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-sm text-red-100">
                            {notificationsError}
                          </div>
                        ) : null}
                        {recentNotifications.map((notification) => {
                          const summary = getNotificationSummary(notification);

                          return (
                            <Link
                              key={notification.id}
                              href={summary.href}
                              onClick={() => {
                                setNotificationsOpen(false);
                                if (!notification.isRead) {
                                  void markNotificationRead(notification.id);
                                }
                              }}
                              className={`mb-1 block rounded-xl px-3 py-3 transition-colors last:mb-0 ${
                                notification.isRead
                                  ? "bg-transparent hover:bg-white/5"
                                  : "bg-wpu-orange/10 hover:bg-wpu-orange/15"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-white">
                                    {summary.title}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs text-white/65">
                                    {summary.description}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                                  {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-wpu-orange" />
                                  )}
                                  <span className="text-[11px] text-white/45">
                                    {formatRelativeTime(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/profile"
                aria-label="Profile"
                className={`relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border transition-colors ${
                  pathname === "/profile"
                    ? "border-wpu-orange text-wpu-orange"
                    : "border-white/15 text-white hover:border-wpu-orange hover:text-wpu-orange"
                }`}
              >
                {userProfilePhotoUrl ? (
                  <span className="h-9 w-9 overflow-hidden rounded-full">
                    <Image
                      src={userProfilePhotoUrl}
                      alt={userName ? `${userName} profile photo` : "Profile photo"}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                    {(userName?.trim().charAt(0) || "U").toUpperCase()}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm ${
                  pathname === "/" ? "text-wpu-orange" : "text-white hover:text-wpu-orange"
                }`}
              >
                Home
              </Link>
              <Link
                href="/login"
                className="flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium text-white transition-colors hover:text-wpu-orange sm:px-3 sm:text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-medium text-white transition-colors hover:text-wpu-orange sm:px-3 sm:text-sm"
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
