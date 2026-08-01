import type { ApplicationListItem } from "@/features/applications/types";

export type CalendarEventType =
  | "APPLICATION_DEADLINE"
  | "APTITUDE_TEST"
  | "NCS_TEST"
  | "TECHNICAL_TEST"
  | "CODING_TEST"
  | "AI_ASSESSMENT"
  | "ASSIGNMENT"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "FINAL_INTERVIEW"
  | "RESULT_ANNOUNCEMENT"
  | "PERSONAL_PREPARATION";

export type CalendarSyncStatus = "NOT_CONNECTED" | "PENDING" | "SYNCED" | "FAILED";

export type ReminderChannel = "INTERNAL" | "GOOGLE_CALENDAR" | "EMAIL";

export interface CalendarReminderRule {
  id: string;
  minutesBefore: number;
  enabled: boolean;
  channel: ReminderChannel;
}

export interface CalendarEvent {
  id: string;
  applicationId: string | null;
  companyName: string;
  positionName: string;
  eventType: CalendarEventType;
  title: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  location: string;
  onlineUrl: string;
  memo: string;
  reminderRules: CalendarReminderRule[];
  googleEventId?: string;
  syncStatus?: CalendarSyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEventFormValues {
  eventType: CalendarEventType;
  title: string;
  applicationId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  onlineUrl: string;
  memo: string;
  remindersEnabled: boolean;
  reminderRules: CalendarReminderRule[];
}

export interface CalendarEventFormErrors {
  eventType?: string;
  title?: string;
  applicationId?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  onlineUrl?: string;
  memo?: string;
  reminderRules?: string;
}

export interface CalendarRouteSearchParams {
  date?: string;
  applicationId?: string;
  eventType?: CalendarEventType;
}

export interface CalendarFormContext {
  applications: ApplicationListItem[];
  initialEvent?: CalendarEvent;
  searchParams?: CalendarRouteSearchParams;
}

export const CALENDAR_EVENT_MEMO_MAX_LENGTH = 1000;
