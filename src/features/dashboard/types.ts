import type { CalendarEventType } from "@/features/calendar/types";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";

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
  companyName: string;
  roleName: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  location: string;
  applicationId: string | null;
  detailHref: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingDeadlines: UpcomingDeadline[];
  upcomingEvents: DashboardUpcomingEvent[];
}
