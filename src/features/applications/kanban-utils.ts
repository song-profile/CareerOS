import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import type { CalendarEvent } from "@/features/calendar/types";
import type { ApplicationListItem, ApplicationStatus } from "@/features/applications/types";

/**
 * 칸반 컬럼은 백엔드 ApplicationStatus 8개와 1:1이다.
 *
 * 여러 상태를 한 컬럼("최종 결과" 안에 최종합격+불합격)으로 묶으면, 그 컬럼에 카드를
 * 떨어뜨렸을 때 둘 중 어느 상태로 바꿀지 시스템이 임의로 골라야 한다. 합격/불합격은
 * 임의로 고를 수 있는 값이 아니라서 묶지 않는다.
 */
export const APPLICATION_KANBAN_COLUMNS: ApplicationStatus[] = [
  "관심",
  "작성중",
  "지원완료",
  "서류",
  "필기",
  "면접",
  "최종합격",
  "불합격",
];

export interface ApplicationKanbanColumn {
  status: ApplicationStatus;
  applications: ApplicationListItem[];
}

export interface ApplicationNextSchedule {
  label: string;
  startAt: Date;
}

export function groupApplicationsByStatus(
  applications: ApplicationListItem[],
): ApplicationKanbanColumn[] {
  return APPLICATION_KANBAN_COLUMNS.map((status) => ({
    status,
    applications: applications.filter((application) => application.status === status),
  }));
}

/**
 * 카드의 "다음 일정". 마감 일정은 카드가 이미 마감일과 D-day로 보여주므로 제외한다.
 */
export function toNextScheduleByApplicationId(
  events: CalendarEvent[],
): Record<string, ApplicationNextSchedule> {
  const nextSchedules: Record<string, ApplicationNextSchedule> = {};

  events.forEach((event) => {
    if (!event.applicationId || event.eventType === "APPLICATION_DEADLINE") {
      return;
    }

    const current = nextSchedules[event.applicationId];

    if (current && current.startAt.getTime() <= event.startAt.getTime()) {
      return;
    }

    nextSchedules[event.applicationId] = {
      label: CALENDAR_EVENT_TYPE_LABEL[event.eventType],
      startAt: event.startAt,
    };
  });

  return nextSchedules;
}
