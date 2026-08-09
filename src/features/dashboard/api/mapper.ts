import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";
import type { DashboardSummaryDto } from "@/features/dashboard/api/dto";
import type {
  DashboardData,
  DashboardUpcomingEvent,
  UpcomingDeadline,
} from "@/features/dashboard/types";

const APPLICATION_STATUS_LABEL: Record<ApplicationStatusDto, string> = {
  INTERESTED: "관심",
  WRITING: "작성중",
  SUBMITTED: "지원완료",
  DOCUMENT_RESULT: "서류",
  TEST: "필기",
  INTERVIEW: "면접",
  FINAL_ACCEPTED: "최종합격",
  FINAL_REJECTED: "불합격",
};

export function toDashboardData(dto: DashboardSummaryDto): DashboardData {
  return {
    summary: dto.summary,
    upcomingDeadlines: dto.upcomingDeadlines.map(toUpcomingDeadline),
    upcomingEvents: dto.upcomingEvents.map(toDashboardUpcomingEvent),
  };
}

function toUpcomingDeadline(dto: DashboardSummaryDto["upcomingDeadlines"][number]): UpcomingDeadline {
  return {
    applicationId: String(dto.applicationId),
    companyName: dto.companyName,
    roleName: dto.positionName,
    dueAt: new Date(dto.deadlineAt),
    status: dto.status,
    statusLabel: APPLICATION_STATUS_LABEL[dto.status],
    daysUntil: dto.daysUntil,
    detailHref: `/applications/${dto.applicationId}`,
  };
}

function toDashboardUpcomingEvent(
  dto: DashboardSummaryDto["upcomingEvents"][number],
): DashboardUpcomingEvent {
  return {
    id: String(dto.eventId),
    type: dto.eventType,
    typeLabel: CALENDAR_EVENT_TYPE_LABEL[dto.eventType],
    companyName: dto.companyName ?? "",
    roleName: dto.positionName ?? "",
    startsAt: new Date(dto.startAt),
    endsAt: new Date(dto.endAt),
    allDay: dto.allDay,
    location: dto.location ?? "",
    applicationId: dto.applicationId === null ? null : String(dto.applicationId),
    detailHref: `/calendar/${dto.eventId}`,
  };
}
