"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode, SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/logout-button";
import type { CurrentUserViewModel } from "@/features/auth/api/dto";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { ALL_NAVIGATION_ITEMS, APP_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEM } from "@/lib/constants/navigation";
import type { NavigationItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: ReactNode;
  currentUser: CurrentUserViewModel;
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findCurrentTitle(pathname: string): string {
  if (pathname === "/notifications" || pathname.startsWith("/notifications/")) {
    return "알림";
  }

  return ALL_NAVIGATION_ITEMS.find((item) => isActivePath(pathname, item.href))?.label ?? "CareerDock";
}

function NavigationLink({
  item,
  onNavigate,
  pathname,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
  pathname: string;
}) {
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-control px-3 py-2 text-body-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        active
          ? "bg-neutral-900 text-white shadow-[0_1px_2px_rgba(31,29,26,0.16)]"
          : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-badge border text-caption font-semibold",
          active ? "border-white/15 bg-white/10 text-white" : "border-neutral-200 bg-white/70",
        )}
      >
        <NavigationIcon name={item.icon} />
      </span>
      <span className="grid gap-0.5">
        <span>{item.label}</span>
        <span className={cn("text-caption", active ? "text-white/70" : "text-neutral-400")}>
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function NavigationIcon({ name }: { name: NavigationItem["icon"] }) {
  const iconProps: SVGProps<SVGSVGElement> = {
    "aria-hidden": true,
    className: "h-4 w-4",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.9,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...iconProps}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5z" />
          <path d="M13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5z" />
          <path d="M4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M13 16h7" />
          <path d="M13 20h7" />
        </svg>
      );
    case "applications":
      return (
        <svg {...iconProps}>
          <path d="M8 5h9.5A1.5 1.5 0 0 1 19 6.5v11A1.5 1.5 0 0 1 17.5 19h-11A1.5 1.5 0 0 1 5 17.5V9" />
          <path d="m5 6 1.4 1.4L9.5 4" />
          <path d="M9 10h6" />
          <path d="M9 14h5" />
          <path d="m5 13 1.2 1.2L8.5 12" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...iconProps}>
          <path d="M7 3v3" />
          <path d="M17 3v3" />
          <path d="M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5z" />
          <path d="M4 9h16" />
          <path d="M8 13h3" />
          <path d="M8 16h6" />
        </svg>
      );
    case "essays":
      return (
        <svg {...iconProps}>
          <path d="M5 19l3.8-.85L18.2 8.75a2.05 2.05 0 0 0-2.9-2.9L5.85 15.3z" />
          <path d="m13.8 7.35 2.85 2.85" />
          <path d="M4 21h16" />
        </svg>
      );
    case "materials":
      return (
        <svg {...iconProps}>
          <path d="M5.5 5h13A1.5 1.5 0 0 1 20 6.5v4H4v-4A1.5 1.5 0 0 1 5.5 5z" />
          <path d="M4 10.5h16v7A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z" />
          <path d="M9 14h6" />
        </svg>
      );
    case "settings":
      return (
        <svg {...iconProps}>
          <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.09-1.65 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.65-1.09H2a2.1 2.1 0 0 1 0-4.2h.06a1.8 1.8 0 0 0 1.65-1.09 1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.09-1.65V2a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.09 1.65 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.09H22a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15z" />
        </svg>
      );
  }
}

function UserPanel({ currentUser }: { currentUser: CurrentUserViewModel }) {
  return (
    <div className="grid gap-3 rounded-card border border-neutral-200/80 bg-white/70 p-3 shadow-[0_1px_2px_rgba(31,29,26,0.04)]">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar currentUser={currentUser} />
        <div className="min-w-0">
          <p className="truncate text-body-medium text-neutral-900">{currentUser.name}</p>
          <p className="truncate text-caption text-neutral-600">{currentUser.email}</p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}

function UserAvatar({ currentUser }: { currentUser: CurrentUserViewModel }) {
  if (currentUser.profileImageUrl) {
    return (
      <Image
        alt={`${currentUser.name} Google 프로필 이미지`}
        className="h-9 w-9 shrink-0 rounded-control object-cover shadow-[0_1px_2px_rgba(31,29,26,0.12)]"
        height={36}
        src={currentUser.profileImageUrl}
        width={36}
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-neutral-900 text-caption font-semibold text-white">
      {getUserInitials(currentUser.name)}
    </div>
  );
}

function Sidebar({
  currentUser,
  pathname,
}: {
  currentUser: CurrentUserViewModel;
  pathname: string;
}) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-neutral-200/80 bg-[#fbfaf8]/88 backdrop-blur-sm lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-neutral-200/80 px-5 py-5">
        <Link
          className="inline-flex items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          href="/dashboard"
        >
          <Image
            alt="CareerDock"
            className="h-9 w-9 rounded-control shadow-[0_1px_2px_rgba(31,29,26,0.12)]"
            height={36}
            src="/logo.jpeg"
            width={36}
          />
          <span className="grid">
            <span className="text-h3 text-neutral-900">CareerDock</span>
            <span className="text-caption text-neutral-400">Job workspace</span>
          </span>
        </Link>
      </div>

      <nav aria-label="주요 메뉴" className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {APP_NAVIGATION_ITEMS.map((item) => (
          <NavigationLink item={item} key={item.href} pathname={pathname} />
        ))}
      </nav>

      <div className="grid gap-3 border-t border-neutral-200/80 p-3">
        <UserPanel currentUser={currentUser} />
      </div>
    </aside>
  );
}

function MobileNavigation({
  closeButtonRef,
  onClose,
  open,
  pathname,
  currentUser,
}: {
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  open: boolean;
  pathname: string;
  currentUser: CurrentUserViewModel;
}) {
  if (!open) {
    return null;
  }

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 lg:hidden" role="dialog">
      <button
        aria-label="모바일 메뉴 닫기"
        className="absolute inset-0 h-full w-full bg-neutral-900/40"
        onClick={onClose}
        type="button"
      />
      <div className="relative flex h-full w-[min(320px,calc(100vw-32px))] flex-col border-r border-neutral-200 bg-neutral-50 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4">
          <Link className="flex items-center gap-3" href="/dashboard" onClick={onClose}>
            <Image
              alt="CareerDock"
              className="h-9 w-9 rounded-control"
              height={36}
              src="/logo.jpeg"
              width={36}
            />
            <span className="text-h3 text-neutral-900">CareerDock</span>
          </Link>
          <Button ref={closeButtonRef} aria-label="메뉴 닫기" onClick={onClose} size="sm" variant="ghost">
            닫기
          </Button>
        </div>

        <nav aria-label="모바일 주요 메뉴" className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {APP_NAVIGATION_ITEMS.map((item) => (
            <NavigationLink item={item} key={item.href} onNavigate={onClose} pathname={pathname} />
          ))}
        </nav>

        <div className="grid gap-3 border-t border-neutral-200/80 p-3">
          <UserPanel currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children, currentUser }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const title = findCurrentTitle(pathname);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileNavigationOpen]);

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 lg:flex">
      <Sidebar currentUser={currentUser} pathname={pathname} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/88 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                aria-expanded={mobileNavigationOpen}
                aria-label="모바일 메뉴 열기"
                className="lg:hidden"
                onClick={() => setMobileNavigationOpen(true)}
                size="sm"
                variant="secondary"
              >
                메뉴
              </Button>
              <div className="min-w-0">
                <p className="truncate text-body-medium text-neutral-900">{title}</p>
                <p className="hidden text-caption text-neutral-600 sm:block">Focused job workspace</p>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <NotificationBell />
              <HeaderSettingsLink pathname={pathname} />
            </div>
          </div>
        </header>

        <main className="px-5 py-7 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto grid w-full max-w-7xl gap-7">{children}</div>
        </main>
      </div>

      <MobileNavigation
        closeButtonRef={closeButtonRef}
        currentUser={currentUser}
        onClose={() => setMobileNavigationOpen(false)}
        open={mobileNavigationOpen}
        pathname={pathname}
      />
    </div>
  );
}

function HeaderSettingsLink({ pathname }: { pathname: string }) {
  const active = isActivePath(pathname, SETTINGS_NAVIGATION_ITEM.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label="설정"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-control border px-3 text-caption font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        active
          ? "border-neutral-900 bg-neutral-900 text-white shadow-[0_1px_2px_rgba(31,29,26,0.16)]"
          : "border-neutral-300 bg-white text-neutral-800 shadow-[0_1px_2px_rgba(31,29,26,0.06)] hover:border-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
      )}
      href={SETTINGS_NAVIGATION_ITEM.href}
    >
      <HeaderSettingsIcon />
      <span>설정</span>
    </Link>
  );
}

function HeaderSettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.09 1.65V21a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.09-1.65 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.65-1.09H2a2.1 2.1 0 0 1 0-4.2h.06a1.8 1.8 0 0 0 1.65-1.09 1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.1 2.1 0 0 1 2.97-2.97l.04.04a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.09-1.65V2a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.09 1.65 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.09H22a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15z" />
    </svg>
  );
}

function getUserInitials(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return "U";
  }

  return trimmed.slice(0, 2).toUpperCase();
}
