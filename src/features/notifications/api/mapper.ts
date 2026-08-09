import type { NotificationDto } from "@/features/notifications/api/dto";
import type { NotificationItem } from "@/features/notifications/types";

export function toNotificationItem(dto: NotificationDto): NotificationItem {
  return {
    id: String(dto.id),
    type: dto.type,
    title: dto.title,
    message: dto.message,
    linkUrl: dto.linkUrl,
    relatedResourceId: dto.relatedResourceId === null ? null : String(dto.relatedResourceId),
    relatedResourceType: dto.relatedResourceType,
    read: dto.read,
    readAt: dto.readAt ? new Date(dto.readAt) : null,
    createdAt: new Date(dto.createdAt),
  };
}
