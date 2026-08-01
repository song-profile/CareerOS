import { applicationMockData } from "@/features/applications/mock-data";
import type { ApplicationListItem } from "@/features/applications/types";
import { calendarEventMockData } from "@/features/calendar/mock-data";
import type { CalendarEvent } from "@/features/calendar/types";

export type CalendarResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string };

export async function getCalendarEvents(): Promise<CalendarResult<CalendarEvent[]>> {
  return { ok: true, value: calendarEventMockData };
}

export async function getCalendarEvent(
  eventId: string,
): Promise<CalendarResult<CalendarEvent>> {
  const event = calendarEventMockData.find((candidate) => candidate.id === eventId);

  if (!event) {
    return { ok: false, message: "일정을 찾을 수 없습니다." };
  }

  return { ok: true, value: event };
}

export async function getCalendarApplications(): Promise<
  CalendarResult<ApplicationListItem[]>
> {
  return { ok: true, value: applicationMockData };
}
