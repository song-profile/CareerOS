"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notification-api";
import type { NotificationItem } from "@/features/notifications/types";
import {
  formatNotificationTime,
  getNotificationTypeLabel,
} from "@/features/notifications/notification-utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadUnreadCount();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadNotifications();

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  async function loadUnreadCount() {
    try {
      setUnreadCount(await fetchUnreadNotificationCount());
    } catch {
      setUnreadCount(0);
    }
  }

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      setNotifications(await fetchNotifications({ limit: 8 }));
      setUnreadCount(await fetchUnreadNotificationCount());
    } catch {
      setError("알림을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenChange() {
    setOpen((value) => !value);
  }

  async function handleNotificationClick(notification: NotificationItem) {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // 이동 자체는 막지 않는다. 상세 페이지 진입 후 다음 조회에서 다시 동기화된다.
      }
    }
    setOpen(false);
  }

  async function handleReadAll() {
    try {
      setUnreadCount(await markAllNotificationsRead());
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch {
      setError("전체 읽음 처리에 실패했습니다.");
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <Button
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `알림 ${unreadCount}개` : "알림"}
        onClick={handleOpenChange}
        size="sm"
        variant="secondary"
      >
        알림
        {unreadCount > 0 ? (
          <span className="ml-1 rounded-badge bg-danger-600 px-1.5 text-caption text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-32px))] rounded-card border border-neutral-200 bg-neutral-0 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-200 p-3">
            <p className="text-body-medium text-neutral-900">알림</p>
            <Button disabled={unreadCount === 0} onClick={handleReadAll} size="sm" variant="ghost">
              전체 읽음
            </Button>
          </div>
          <div aria-busy={loading} className="max-h-[420px] overflow-y-auto">
            {loading ? <p className="p-4 text-body text-neutral-600">알림을 불러오는 중입니다.</p> : null}
            {error ? (
              <p className="p-4 text-body text-danger-700" role="alert">
                {error}
              </p>
            ) : null}
            {!loading && !error && notifications.length === 0 ? (
              <p className="p-4 text-body text-neutral-600">새 알림이 없습니다.</p>
            ) : null}
            {!loading && !error
              ? notifications.map((notification) => (
                  <NotificationDropdownItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => void handleNotificationClick(notification)}
                  />
                ))
              : null}
          </div>
          <div className="border-t border-neutral-200 p-3">
            <Link
              className="block rounded-control px-3 py-2 text-center text-body-medium text-primary-700 hover:bg-primary-50"
              href="/notifications"
              onClick={() => setOpen(false)}
            >
              전체 알림 보기
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationDropdownItem({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: () => void;
}) {
  const href = notification.linkUrl ?? "/notifications";

  return (
    <Link
      className="grid gap-1 border-b border-neutral-100 p-3 hover:bg-neutral-50"
      href={href}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Badge variant={notification.read ? "neutral" : "primary"}>
          {getNotificationTypeLabel(notification.type)}
        </Badge>
        {!notification.read ? <span className="h-2 w-2 rounded-full bg-danger-600" /> : null}
      </div>
      <p className="text-body-medium text-neutral-900">{notification.title}</p>
      <p className="line-clamp-2 text-body text-neutral-600">{notification.message}</p>
      <p className="text-caption text-neutral-400">{formatNotificationTime(notification)}</p>
    </Link>
  );
}
