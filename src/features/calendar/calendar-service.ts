import { cookies } from "next/headers";
import { fetchApplicationsForCurrentUser } from "@/features/applications/api/server-application-api";
import type { ApplicationListItem } from "@/features/applications/types";
import type { CalendarEvent } from "@/features/calendar/types";
import type {
  CalendarEventDto,
  CalendarEventQueryDto,
} from "@/features/calendar/api/dto";
import { toCalendarEventViewModel } from "@/features/calendar/api/mapper";
import { createApiUrl } from "@/lib/api/client";
import { getServerResultErrorMessage } from "@/lib/api/error-message";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiQueryParams } from "@/lib/api/types";

export type CalendarResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function getCalendarEvents(
  query?: CalendarEventQueryDto,
): Promise<CalendarResult<CalendarEvent[]>> {
  const result = await serverCalendarRequest<CalendarEventDto[]>(
    apiEndpoints.calendar.events,
    "일정 목록을 불러올 수 없습니다.",
    query,
  );

  return result.ok
    ? { ok: true, value: result.value.map(toCalendarEventViewModel) }
    : result;
}

export async function getUpcomingCalendarEvents(
  limit = 8,
): Promise<CalendarResult<CalendarEvent[]>> {
  return getCalendarEvents({ upcoming: true, limit });
}

export async function getCalendarEvent(
  eventId: string,
): Promise<CalendarResult<CalendarEvent>> {
  const result = await serverCalendarRequest<CalendarEventDto>(
    apiEndpoints.calendar.event(eventId),
    "일정을 불러올 수 없습니다.",
  );

  return result.ok ? { ok: true, value: toCalendarEventViewModel(result.value) } : result;
}

export async function getCalendarApplications(): Promise<
  CalendarResult<ApplicationListItem[]>
> {
  const result = await fetchApplicationsForCurrentUser();

  return result.ok
    ? result
    : { ok: false, message: result.message, status: result.status };
}

async function serverCalendarRequest<TValue>(
  path: string,
  fallbackMessage: string,
  query?: ApiQueryParams,
): Promise<CalendarResult<TValue>> {
  try {
    const response = await fetch(createApiUrl(path, query), {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: await createServerCookieHeader(),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: getServerResultErrorMessage(response.status, fallbackMessage),
        status: response.status,
      };
    }

    return { ok: true, value: (await response.json()) as TValue };
  } catch {
    return { ok: false, message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요." };
  }
}

async function createServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
