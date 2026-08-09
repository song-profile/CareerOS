import type { CalendarEventType } from "@/features/calendar/types";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";

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

export interface DashboardSummaryDto {
  summary: DashboardCountsDto;
  upcomingDeadlines: DashboardDeadlineDto[];
  upcomingEvents: DashboardEventDto[];
}
