import type { ApiModuleContract } from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { CalendarEvent, CalendarEventFormValues } from "@/features/calendar/types";
import type {
  CalendarConnectResponseDto,
  CalendarEventDto,
  CalendarEventQueryDto,
  CalendarEventRequestDto,
  CalendarStatusResponseDto,
  CalendarSyncResponseDto,
  CalendarTestEventResponseDto,
} from "@/features/calendar/api/dto";
import {
  toCalendarEventRequestDto,
  toCalendarEventViewModel,
} from "@/features/calendar/api/mapper";

export const calendarApi = {
  endpoints: {
    list: defineEndpoint<CalendarEventQueryDto | undefined, CalendarEventDto[], CalendarEvent[]>({
      method: "GET",
      path: apiEndpoints.calendar.events,
      response: (dtos) => dtos.map(toCalendarEventViewModel),
    }),
    create: defineEndpoint<CalendarEventRequestDto, CalendarEventDto, CalendarEvent>({
      method: "POST",
      path: apiEndpoints.calendar.events,
      response: toCalendarEventViewModel,
    }),
    detail: defineEndpoint<void, CalendarEventDto, CalendarEvent>({
      method: "GET",
      path: apiEndpoints.calendar.event,
      response: toCalendarEventViewModel,
    }),
    update: defineEndpoint<CalendarEventRequestDto, CalendarEventDto, CalendarEvent>({
      method: "PATCH",
      path: apiEndpoints.calendar.event,
      response: toCalendarEventViewModel,
    }),
    delete: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.calendar.event,
    }),
    connect: defineEndpoint<void, CalendarConnectResponseDto>({
      method: "POST",
      path: apiEndpoints.calendar.connect,
    }),
    status: defineEndpoint<void, CalendarStatusResponseDto>({
      method: "GET",
      path: apiEndpoints.calendar.status,
    }),
    sync: defineEndpoint<void, CalendarSyncResponseDto>({
      method: "POST",
      path: apiEndpoints.calendar.sync,
    }),
    disconnect: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.calendar.disconnect,
    }),
    testEvent: defineEndpoint<void, CalendarTestEventResponseDto>({
      method: "POST",
      path: apiEndpoints.calendar.testEvent,
    }),
  },
  mapper: {
    toCalendarEventRequestDto,
    toCalendarEventViewModel,
  },
};

export async function fetchCalendarEvents(
  query?: CalendarEventQueryDto,
): Promise<CalendarEvent[]> {
  const dtos = await apiClient<CalendarEventDto[]>(apiEndpoints.calendar.events, { query });
  return dtos.map(toCalendarEventViewModel);
}

export async function fetchUpcomingCalendarEvents(limit = 8): Promise<CalendarEvent[]> {
  return fetchCalendarEvents({ upcoming: true, limit });
}

export async function fetchCalendarEvent(id: string): Promise<CalendarEvent> {
  const dto = await apiClient<CalendarEventDto>(apiEndpoints.calendar.event(id));
  return toCalendarEventViewModel(dto);
}

export async function createCalendarEvent(
  values: CalendarEventFormValues,
): Promise<CalendarEvent> {
  const dto = await apiClient<CalendarEventDto>(apiEndpoints.calendar.events, {
    method: "POST",
    body: toCalendarEventRequestDto(values),
  });
  return toCalendarEventViewModel(dto);
}

export async function updateCalendarEvent(
  id: string,
  values: CalendarEventFormValues,
): Promise<CalendarEvent> {
  const dto = await apiClient<CalendarEventDto>(apiEndpoints.calendar.event(id), {
    method: "PATCH",
    body: toCalendarEventRequestDto(values),
  });
  return toCalendarEventViewModel(dto);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.calendar.event(id), { method: "DELETE" });
}

export async function connectGoogleCalendar(): Promise<CalendarConnectResponseDto> {
  return apiClient<CalendarConnectResponseDto>(apiEndpoints.calendar.connect, { method: "POST" });
}

export async function fetchGoogleCalendarStatus(): Promise<CalendarStatusResponseDto> {
  return apiClient<CalendarStatusResponseDto>(apiEndpoints.calendar.status);
}

export async function syncGoogleCalendar(): Promise<CalendarSyncResponseDto> {
  return apiClient<CalendarSyncResponseDto>(apiEndpoints.calendar.sync, { method: "POST" });
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await apiClient<void>(apiEndpoints.calendar.disconnect, { method: "DELETE" });
}

export async function createGoogleCalendarTestEvent(): Promise<CalendarTestEventResponseDto> {
  return apiClient<CalendarTestEventResponseDto>(apiEndpoints.calendar.testEvent, {
    method: "POST",
  });
}

export const calendarApiContract: ApiModuleContract = {
  moduleName: "calendarApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/calendar/events",
    "GET /api/calendar/events?start={instant}&end={instant}",
    "GET /api/calendar/events?upcoming=true&limit={n}",
    "POST /api/calendar/events",
    "GET /api/calendar/events/{id}",
    "PATCH /api/calendar/events/{id}",
    "DELETE /api/calendar/events/{id}",
    "POST /api/calendar/connect",
    "GET /api/calendar/status",
    "POST /api/calendar/sync",
    "DELETE /api/calendar/disconnect",
    "POST /api/calendar/test-event",
  ],
  notes: [
    "Google Calendar 권한 동의는 로그인과 분리되어 있으며 사용자가 연결 버튼을 누를 때만 시작합니다.",
    "프론트 CalendarEventType/ReminderChannel/SyncStatus 리터럴은 백엔드 enum과 동일합니다.",
    "Calendar 연결 API는 기존 백엔드 URL(/api/calendar/connect/status/sync/disconnect/test-event)을 따른다.",
  ],
};
