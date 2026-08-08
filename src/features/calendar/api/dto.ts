import type {
  CalendarEventType,
  CalendarSyncStatus,
  ReminderChannel,
} from "@/features/calendar/types";

export type CalendarEventTypeDto = CalendarEventType;
export type CalendarSyncStatusDto = CalendarSyncStatus;
export type CalendarReminderChannelDto = ReminderChannel;

export interface CalendarReminderRuleDto {
  id: number;
  minutesBefore: number;
  channel: CalendarReminderChannelDto;
  enabled: boolean;
}

export interface CalendarReminderRuleRequestDto {
  minutesBefore: number;
  channel: CalendarReminderChannelDto;
  enabled: boolean;
}

export interface CalendarEventDto {
  id: number;
  applicationId: number | null;
  companyName: string | null;
  positionName: string | null;
  eventType: CalendarEventTypeDto;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string | null;
  onlineUrl: string | null;
  memo: string | null;
  googleEventId: string | null;
  syncStatus: CalendarSyncStatusDto;
  syncFailureReason: string | null;
  reminderRules: CalendarReminderRuleDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventRequestDto {
  applicationId: number | null;
  eventType: CalendarEventTypeDto;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  onlineUrl: string | null;
  memo: string | null;
  reminderRules?: CalendarReminderRuleRequestDto[];
}

export interface CalendarEventQueryDto {
  start?: string;
  end?: string;
  upcoming?: boolean;
  limit?: number;
  applicationId?: number;
  eventType?: CalendarEventTypeDto;
}

export interface CalendarConnectResponseDto {
  authorizationUrl: string;
}

export interface CalendarStatusResponseDto {
  connected: boolean;
  status: CalendarSyncStatusDto;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  eventCounts: Partial<Record<CalendarSyncStatusDto, number>>;
}

export interface CalendarSyncResponseDto {
  attempted: number;
  synced: number;
  failed: number;
}

export interface CalendarTestEventResponseDto {
  googleEventId: string;
  htmlLink: string | null;
}
