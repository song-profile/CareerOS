import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import type { ApplicationStatusDto } from "@/features/applications/api/dto";
import type { DashboardSummaryDto } from "@/features/dashboard/api/dto";
import type {
  DashboardData,
  DashboardImportantNotification,
  DashboardPreparationItem,
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
    todayEvents: (dto.todayEvents ?? []).map(toDashboardUpcomingEvent),
    weekEvents: (dto.weekEvents ?? []).map(toDashboardUpcomingEvent),
    googleCalendar: dto.googleCalendar ?? {
      autoSyncEnabled: false,
      connected: false,
      failedCount: 0,
      pendingCount: 0,
      syncedCount: 0,
    },
    preparationItems: (dto.preparationItems ?? []).map(toPreparationItem),
    importantNotifications: (dto.importantNotifications ?? []).map(toImportantNotification),
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
    title: dto.title,
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

function toPreparationItem(dto: NonNullable<DashboardSummaryDto["preparationItems"]>[number]): DashboardPreparationItem {
  return {
    applicationId: String(dto.applicationId),
    companyName: dto.companyName,
    roleName: dto.positionName,
    status: dto.status,
    statusLabel: APPLICATION_STATUS_LABEL[dto.status],
    deadlineAt: dto.deadlineAt === null ? null : new Date(dto.deadlineAt),
    daysUntil: dto.daysUntil,
    essayQuestionCount: dto.essayQuestionCount,
    essayAnswerCount: dto.essayAnswerCount,
    materialCount: dto.materialCount,
    eventCount: dto.eventCount,
    detailHref: `/applications/${dto.applicationId}`,
  };
}

function toImportantNotification(
  dto: NonNullable<DashboardSummaryDto["importantNotifications"]>[number],
): DashboardImportantNotification {
  return {
    id: String(dto.notificationId),
    type: dto.type,
    title: dto.title,
    message: dto.message,
    linkUrl: dto.linkUrl,
    createdAt: new Date(dto.createdAt),
  };
}
