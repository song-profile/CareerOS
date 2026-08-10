import type { CalendarEventType } from "@/features/calendar/types";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";
import type { NotificationType } from "@/features/notifications/types";

export interface DashboardCountsDto {
  weeklyDeadlineCount: number;
  upcomingEventCount: number;
  draftingApplicationCount: number;
}

export interface DashboardDeadlineDto {
  applicationId: number;
  companyName: string;
  positionName: string;
  deadlineAt: string;
  status: ApplicationStatusDto;
  daysUntil: number;
}

export interface DashboardEventDto {
  eventId: number;
  applicationId: number | null;
  companyName: string | null;
  positionName: string | null;
  eventType: CalendarEventType;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string | null;
}

export interface DashboardGoogleCalendarDto {
  connected: boolean;
  autoSyncEnabled: boolean;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface DashboardPreparationDto {
  applicationId: number;
  companyName: string;
  positionName: string;
  status: ApplicationStatusDto;
  deadlineAt: string | null;
  daysUntil: number | null;
  essayQuestionCount: number;
  essayAnswerCount: number;
  materialCount: number;
  eventCount: number;
}

export interface DashboardNotificationDto {
  notificationId: number;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  createdAt: string;
}

export interface DashboardSummaryDto {
  summary: DashboardCountsDto;
  upcomingDeadlines: DashboardDeadlineDto[];
  upcomingEvents: DashboardEventDto[];
  todayEvents?: DashboardEventDto[];
  weekEvents?: DashboardEventDto[];
  googleCalendar?: DashboardGoogleCalendarDto;
  preparationItems?: DashboardPreparationDto[];
  importantNotifications?: DashboardNotificationDto[];
}
