"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notification-api";
import type { NotificationItem } from "@/features/notifications/types";
import {
  formatNotificationTime,
  getNotificationTypeLabel,
} from "@/features/notifications/notification-utils";
import { getApiClientErrorMessage } from "@/lib/api/error-message";

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setErrorMessage("");
    try {
      setNotifications(await fetchNotifications({ limit: 50 }));
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "알림 목록을 불러올 수 없습니다."));
    } finally {
      setLoading(false);
    }
  }

  async function handleRead(notification: NotificationItem) {
    if (notification.read) {
      return;
    }

    setActiveId(notification.id);
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "읽음 처리에 실패했습니다."));
    } finally {
      setActiveId(null);
    }
  }

  async function handleReadAll() {
    setActiveId("all");
    try {
      await markAllNotificationsRead();
      setNotifications((items) => items.map((item) => ({ ...item, read: true, readAt: new Date() })));
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "전체 읽음 처리에 실패했습니다."));
    } finally {
      setActiveId(null);
    }
  }

  async function handleDelete(notificationId: string) {
    setActiveId(notificationId);
    try {
      await deleteNotification(notificationId);
      setNotifications((items) => items.filter((item) => item.id !== notificationId));
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, "알림 삭제에 실패했습니다."));
    } finally {
      setActiveId(null);
    }
  }

  if (loading) {
    return (
      <Card aria-busy="true" role="status">
        <CardContent>
          <p className="text-body text-neutral-600">알림을 불러오는 중입니다.</p>
        </CardContent>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card role="alert">
        <CardContent>
          <div className="grid gap-3">
            <p className="text-body-medium text-danger-700">{errorMessage}</p>
            <Button className="w-fit" onClick={load} variant="secondary">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-body text-neutral-600">아직 알림이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button disabled={activeId !== null} onClick={handleReadAll} variant="secondary">
          전체 읽음
        </Button>
      </div>
      <div className="grid gap-3">
        {notifications.map((notification) => (
          <Card className={notification.read ? undefined : "border-primary-100 bg-primary-50"} key={notification.id}>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <Link
                  className="grid gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  href={notification.linkUrl ?? "/notifications"}
                  onClick={() => void handleRead(notification)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={notification.read ? "neutral" : "primary"}>
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>
                    {!notification.read ? <span className="text-caption text-primary-700">읽지 않음</span> : null}
                    <span className="text-caption text-neutral-400">
                      {formatNotificationTime(notification)}
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-body-medium text-neutral-900">{notification.title}</p>
                    <p className="text-body text-neutral-600">{notification.message}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button
                    disabled={notification.read || activeId !== null}
                    loading={activeId === notification.id}
                    onClick={() => void handleRead(notification)}
                    size="sm"
                    variant="secondary"
                  >
                    읽음
                  </Button>
                  <Button
                    disabled={activeId !== null}
                    onClick={() => void handleDelete(notification.id)}
                    size="sm"
                    variant="danger"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
