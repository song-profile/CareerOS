import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type {
  NotificationDto,
  NotificationUnreadCountDto,
} from "@/features/notifications/api/dto";
import { toNotificationItem } from "@/features/notifications/api/mapper";
import type { NotificationItem } from "@/features/notifications/types";

export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<NotificationItem[]> {
  const dtos = await apiClient<NotificationDto[]>(apiEndpoints.notifications.list, {
    query: options,
  });
  return dtos.map(toNotificationItem);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const response = await apiClient<NotificationUnreadCountDto>(apiEndpoints.notifications.unreadCount);
  return response.unreadCount;
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const dto = await apiClient<NotificationDto>(apiEndpoints.notifications.read(id), {
    method: "PATCH",
  });
  return toNotificationItem(dto);
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await apiClient<NotificationUnreadCountDto>(apiEndpoints.notifications.readAll, {
    method: "PATCH",
  });
  return response.unreadCount;
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.notifications.detail(id), {
    method: "DELETE",
  });
}
