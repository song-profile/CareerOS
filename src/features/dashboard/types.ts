import type { CalendarEventType } from "@/features/calendar/types";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";
import type { NotificationType } from "@/features/notifications/types";

export type DashboardApplicationStatus = ApplicationStatusDto;

export interface DashboardSummary {
  weeklyDeadlineCount: number;
  upcomingEventCount: number;
  draftingApplicationCount: number;
}

export interface UpcomingDeadline {
  applicationId: string;
  companyName: string;
  roleName: string;
  dueAt: Date;
  status: DashboardApplicationStatus;
  statusLabel: string;
  daysUntil: number;
  detailHref: string;
}

export interface DashboardUpcomingEvent {
  id: string;
  type: CalendarEventType;
  typeLabel: string;
  title: string;
  companyName: string;
  roleName: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  location: string;
  applicationId: string | null;
  detailHref: string;
}

export interface DashboardGoogleCalendar {
  connected: boolean;
  autoSyncEnabled: boolean;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface DashboardPreparationItem {
  applicationId: string;
  companyName: string;
  roleName: string;
  status: DashboardApplicationStatus;
  statusLabel: string;
  deadlineAt: Date | null;
  daysUntil: number | null;
  essayQuestionCount: number;
  essayAnswerCount: number;
  materialCount: number;
  eventCount: number;
  detailHref: string;
}

export interface DashboardImportantNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string | null;
  createdAt: Date;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingDeadlines: UpcomingDeadline[];
  upcomingEvents: DashboardUpcomingEvent[];
  todayEvents: DashboardUpcomingEvent[];
  weekEvents: DashboardUpcomingEvent[];
  googleCalendar: DashboardGoogleCalendar;
  preparationItems: DashboardPreparationItem[];
  importantNotifications: DashboardImportantNotification[];
}
