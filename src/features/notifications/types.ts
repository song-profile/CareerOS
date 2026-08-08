export type NotificationType =
  | "APPLICATION_DEADLINE"
  | "INTERVIEW"
  | "CODING_TEST"
  | "CALENDAR_EVENT"
  | "CREDENTIAL_EXPIRATION"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  relatedResourceType: string | null;
  relatedResourceId: string | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
}
