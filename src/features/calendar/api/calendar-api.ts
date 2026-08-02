import type { ApiModuleContract } from "@/lib/api/types";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { CalendarEvent } from "@/features/calendar/types";
import type {
  CalendarEventDto,
  CalendarEventQueryDto,
  CalendarEventRequestDto,
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
  },
  mapper: {
    toCalendarEventRequestDto,
    toCalendarEventViewModel,
  },
};

export const calendarApiContract: ApiModuleContract = {
  moduleName: "calendarApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/calendar/events",
    "POST /api/calendar/events",
    "GET /api/calendar/events/{id}",
    "PATCH /api/calendar/events/{id}",
    "DELETE /api/calendar/events/{id}",
  ],
  notes: [
    "Google Calendar 실제 동기화는 MVP 2입니다. 지금은 내부 일정과 알림 규칙만 준비합니다.",
    "프론트 CalendarEventType/ReminderChannel/SyncStatus 리터럴은 백엔드 enum과 동일합니다.",
    "이 모듈은 endpoint와 mapper만 정의하며 실제 API를 호출하지 않습니다.",
  ],
};
