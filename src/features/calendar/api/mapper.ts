import type {
  CalendarEvent,
  CalendarEventFormValues,
  CalendarReminderRule,
} from "@/features/calendar/types";
import type {
  CalendarEventDto,
  CalendarEventRequestDto,
  CalendarReminderRuleDto,
  CalendarReminderRuleRequestDto,
} from "@/features/calendar/api/dto";

export function toCalendarEventViewModel(dto: CalendarEventDto): CalendarEvent {
  return {
    id: String(dto.id),
    applicationId: dto.applicationId === null ? null : String(dto.applicationId),
    companyName: dto.companyName ?? "",
    positionName: dto.positionName ?? "",
    eventType: dto.eventType,
    title: dto.title,
    startAt: new Date(dto.startAt),
    endAt: new Date(dto.endAt),
    allDay: dto.allDay,
    location: dto.location ?? "",
    onlineUrl: dto.onlineUrl ?? "",
    memo: dto.memo ?? "",
    googleEventId: dto.googleEventId ?? undefined,
    syncStatus: dto.syncStatus,
    syncFailureReason: dto.syncFailureReason ?? undefined,
    reminderRules: dto.reminderRules.map(toCalendarReminderRuleViewModel),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function toCalendarEventRequestDto(
  values: CalendarEventFormValues,
): CalendarEventRequestDto {
  return {
    applicationId: toNullableNumber(values.applicationId),
    eventType: values.eventType,
    title: values.title.trim(),
    startAt: toInstantString(toDateTimeInput(values.startDate, values.startTime, values.allDay)),
    endAt: toInstantString(toDateTimeInput(values.endDate, values.endTime, values.allDay)),
    allDay: values.allDay,
    location: emptyToNull(values.location),
    onlineUrl: emptyToNull(values.onlineUrl),
    memo: emptyToNull(values.memo),
    reminderRules: values.remindersEnabled
      ? values.reminderRules.map(toCalendarReminderRuleRequestDto)
      : [],
  };
}

export function toCalendarReminderRuleViewModel(
  dto: CalendarReminderRuleDto,
): CalendarReminderRule {
  return {
    id: String(dto.id),
    minutesBefore: dto.minutesBefore,
    channel: dto.channel,
    enabled: dto.enabled,
  };
}

export function toCalendarReminderRuleRequestDto(
  rule: CalendarReminderRule,
): CalendarReminderRuleRequestDto {
  return {
    minutesBefore: rule.minutesBefore,
    channel: rule.channel,
    enabled: rule.enabled,
  };
}

function toNullableNumber(value: string | null): number | null {
  if (value === null || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInstantString(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function toDateTimeInput(date: string, time: string, allDay: boolean): string {
  if (!date) {
    return "";
  }

  return allDay ? `${date}T00:00` : `${date}T${time || "00:00"}`;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
