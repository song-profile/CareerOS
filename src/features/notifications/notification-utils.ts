import type { NotificationItem, NotificationType } from "@/features/notifications/types";

const typeLabel: Record<NotificationType, string> = {
  APPLICATION_DEADLINE: "지원 마감",
  CALENDAR_EVENT: "일정",
  CODING_TEST: "코딩테스트",
  CREDENTIAL_EXPIRATION: "자격 만료",
  INTERVIEW: "면접",
  SYSTEM: "시스템",
};

export function getNotificationTypeLabel(type: NotificationType): string {
  return typeLabel[type];
}

export function formatNotificationTime(notification: NotificationItem): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(notification.createdAt);
}
