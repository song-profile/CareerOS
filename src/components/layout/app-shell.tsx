"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ALL_NAVIGATION_ITEMS, APP_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEM } from "@/lib/constants/navigation";
import type { NavigationItem } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

interface AppShellProps {
  children: ReactNode;
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findCurrentTitle(pathname: string): string {
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
          ? "bg-primary-50 text-primary-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-badge border text-caption font-semibold",
          active ? "border-primary-100 bg-neutral-0 text-primary-700" : "border-neutral-200 bg-neutral-0",
        )}
      >
        {item.iconLabel}
      </span>
      <span className="grid gap-0.5">
        <span>{item.label}</span>
        <span className={cn("text-caption", active ? "text-primary-600" : "text-neutral-400")}>
          {item.description}
        </span>
      </span>
    </Link>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r border-neutral-200 bg-neutral-0 lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-neutral-200 px-5 py-5">
        <Link
          className="inline-flex items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          href="/dashboard"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-600 text-body-medium text-white">
            CD
          </span>
          <span className="grid">
            <span className="text-h3 text-neutral-900">CareerDock</span>
            <span className="text-caption text-neutral-400">Job workspace</span>
          </span>
        </Link>
      </div>

      <nav aria-label="주요 메뉴" className="flex-1 space-y-1 overflow-y-auto p-3">
        {APP_NAVIGATION_ITEMS.map((item) => (
          <NavigationLink item={item} key={item.href} pathname={pathname} />
        ))}
      </nav>

      <div className="grid gap-3 border-t border-neutral-200 p-3">
        <NavigationLink item={SETTINGS_NAVIGATION_ITEM} pathname={pathname} />
        <div className="rounded-card border border-neutral-200 bg-neutral-50 p-3">
          <p className="text-body-medium text-neutral-900">사용자</p>
          <p className="text-caption text-neutral-600">로그인 정보 영역</p>
        </div>
      </div>
    </aside>
  );
}

function MobileNavigation({
  closeButtonRef,
  onClose,
  open,
  pathname,
}: {
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  open: boolean;
  pathname: string;
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
      <div className="relative flex h-full w-[min(320px,calc(100vw-32px))] flex-col border-r border-neutral-200 bg-neutral-0 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <Link className="flex items-center gap-3" href="/dashboard" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-600 text-body-medium text-white">
              CD
            </span>
            <span className="text-h3 text-neutral-900">CareerDock</span>
          </Link>
          <Button ref={closeButtonRef} aria-label="메뉴 닫기" onClick={onClose} size="sm" variant="ghost">
            닫기
          </Button>
        </div>

        <nav aria-label="모바일 주요 메뉴" className="flex-1 space-y-1 overflow-y-auto p-3">
          {APP_NAVIGATION_ITEMS.map((item) => (
            <NavigationLink item={item} key={item.href} onNavigate={onClose} pathname={pathname} />
          ))}
        </nav>

        <div className="grid gap-3 border-t border-neutral-200 p-3">
          <NavigationLink item={SETTINGS_NAVIGATION_ITEM} onNavigate={onClose} pathname={pathname} />
          <div className="rounded-card border border-neutral-200 bg-neutral-50 p-3">
            <p className="text-body-medium text-neutral-900">사용자</p>
            <p className="text-caption text-neutral-600">로그인 정보 영역</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 lg:flex">
      <Sidebar pathname={pathname} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-0/95 backdrop-blur">
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
                <p className="hidden text-caption text-neutral-600 sm:block">CareerDock workspace</p>
              </div>
            </div>
            <div className="rounded-control border border-neutral-200 bg-neutral-50 px-3 py-2 text-caption text-neutral-600">
              사용자
            </div>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-8">{children}</div>
        </main>
      </div>

      <MobileNavigation
        closeButtonRef={closeButtonRef}
        onClose={() => setMobileNavigationOpen(false)}
        open={mobileNavigationOpen}
        pathname={pathname}
      />
    </div>
  );
}
