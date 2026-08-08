import type { NotificationType } from "@/features/notifications/types";

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  relatedResourceType: string | null;
  relatedResourceId: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationUnreadCountDto {
  unreadCount: number;
}
