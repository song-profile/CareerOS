"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LinkButton } from "@/components/ui/link-button";
import { Toast } from "@/components/ui/toast";
import {
  deleteCalendarEvent,
  syncGoogleCalendar,
} from "@/features/calendar/api/calendar-api";
import { EventTypeBadge } from "@/features/calendar/components/event-type-badge";
import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import {
  formatEventDateTime,
  getDDayLabel,
  isSameDate,
} from "@/features/calendar/date-utils";
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarSyncStatus,
} from "@/features/calendar/types";
import { cn } from "@/lib/utils/cn";

interface ApplicationRecruitmentTimelineProps {
  applicationId: string;
  errorMessage?: string;
  events: CalendarEvent[];
}

type TimelineEventState = "done" | "today" | "upcoming";

const quickAddTypes: Array<{ eventType: CalendarEventType; label: string }> = [
  { eventType: "CODING_TEST", label: "코딩테스트 추가" },
  { eventType: "FIRST_INTERVIEW", label: "면접 추가" },
  { eventType: "RESULT_ANNOUNCEMENT", label: "결과 발표 추가" },
];

const syncStatusLabel: Record<CalendarSyncStatus, string> = {
  NOT_CONNECTED: "미연결",
  PENDING: "동기화 대기",
  SYNCED: "동기화됨",
  FAILED: "동기화 실패",
};

const syncStatusVariant: Record<CalendarSyncStatus, "neutral" | "primary" | "success" | "danger"> = {
  NOT_CONNECTED: "neutral",
  PENDING: "primary",
  SYNCED: "success",
  FAILED: "danger",
};

export function ApplicationRecruitmentTimeline({
  applicationId,
  errorMessage,
  events,
}: ApplicationRecruitmentTimelineProps) {
  const router = useRouter();
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [syncingEventId, setSyncingEventId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const sortedEvents = useMemo(() => sortRecruitmentEvents(events), [events]);

  async function handleRetrySync(eventId: string) {
    setSyncingEventId(eventId);
    setNotice(null);

    try {
      await syncGoogleCalendar();
      setNotice({ tone: "success", message: "Google Calendar 재동기화를 요청했습니다." });
      router.refresh();
    } catch {
      setNotice({ tone: "error", message: "Google Calendar 재동기화에 실패했습니다." });
    } finally {
      setSyncingEventId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      await deleteCalendarEvent(deleteTarget.id);
      setNotice({ tone: "success", message: "채용 일정을 삭제했습니다." });
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setNotice({ tone: "error", message: "채용 일정 삭제에 실패했습니다." });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {quickAddTypes.map((item) => (
          <LinkButton
            href={`/calendar/new?applicationId=${applicationId}&eventType=${item.eventType}`}
            key={item.eventType}
            variant="secondary"
          >
            {item.label}
          </LinkButton>
        ))}
        <LinkButton href={`/calendar/new?applicationId=${applicationId}`} variant="secondary">
          일정 추가
        </LinkButton>
        <LinkButton href={`/calendar?applicationId=${applicationId}`} variant="secondary">
          내부 Calendar에서 보기
        </LinkButton>
      </div>

      {notice ? <Toast tone={notice.tone}>{notice.message}</Toast> : null}

      {errorMessage ? (
        <p
          className="rounded-control border border-danger-100 bg-danger-50 px-3 py-2 text-body text-danger-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : sortedEvents.length > 0 ? (
        <ol className="grid gap-0">
          {sortedEvents.map((event, index) => (
            <RecruitmentTimelineItem
              event={event}
              isLast={index === sortedEvents.length - 1}
              key={event.id}
              onDelete={() => setDeleteTarget(event)}
              onRetrySync={() => void handleRetrySync(event.id)}
              retrying={syncingEventId === event.id}
            />
          ))}
        </ol>
      ) : (
        <div className="grid gap-3 rounded-control border border-dashed border-neutral-200 bg-neutral-50 p-4">
          <p className="text-body-medium text-neutral-900">아직 등록된 채용 일정이 없습니다.</p>
          <p className="text-body text-neutral-600">
            코딩테스트나 면접 일정이 나오면 추가해보세요.
          </p>
          <LinkButton
            className="w-full sm:w-fit"
            href={`/calendar/new?applicationId=${applicationId}`}
            variant="secondary"
          >
            일정 추가
          </LinkButton>
        </div>
      )}

      {deleteTarget ? (
        <Dialog
          description={
            <p className="break-words">
              {deleteTarget.title} 일정을 삭제하면 지원 상세와 캘린더에서 함께 사라집니다.
            </p>
          }
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={deleting} onClick={() => setDeleteTarget(null)} variant="secondary">
                취소
              </Button>
              <Button loading={deleting} onClick={() => void handleDelete()} variant="danger">
                삭제
              </Button>
            </div>
          }
          onClose={() => setDeleteTarget(null)}
          title="채용 일정 삭제"
        />
      ) : null}
    </div>
  );
}

function RecruitmentTimelineItem({
  event,
  isLast,
  onDelete,
  onRetrySync,
  retrying,
}: {
  event: CalendarEvent;
  isLast: boolean;
  onDelete: () => void;
  onRetrySync: () => void;
  retrying: boolean;
}) {
  const state = getTimelineEventState(event);
  const syncStatus = event.syncStatus ?? "NOT_CONNECTED";

  return (
    <li className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <div className="relative flex justify-center">
        <span
          className={cn(
            "mt-1 h-3 w-3 rounded-full border",
            state === "done" && "border-success-500 bg-success-500",
            state === "today" && "border-primary-600 bg-primary-600",
            state === "upcoming" && "border-neutral-300 bg-neutral-0",
          )}
        />
        {!isLast ? <span className="absolute top-5 h-full w-px bg-neutral-200" /> : null}
      </div>

      <article className="mb-4 grid gap-3 rounded-control border border-neutral-200 bg-neutral-0 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="grid min-w-0 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <EventTypeBadge eventType={event.eventType} />
              <Badge variant={eventStateVariant(state)}>{eventStateLabel(state)}</Badge>
              <Badge variant="neutral">{getDDayLabel(event.startAt)}</Badge>
              <Badge variant={syncStatusVariant[syncStatus]}>{syncStatusLabel[syncStatus]}</Badge>
              {event.autoGenerated ? <Badge variant="primary">자동 생성</Badge> : null}
            </div>
            <div className="grid gap-1">
              <h3 className="break-words text-body-medium text-neutral-900">{event.title}</h3>
              <time className="font-mono text-mono text-neutral-600" dateTime={event.startAt.toISOString()}>
                {event.allDay ? `${formatEventDateTime(event.startAt)} · 종일` : formatEventDateTime(event.startAt)}
              </time>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {syncStatus === "FAILED" ? (
              <Button loading={retrying} onClick={onRetrySync} size="sm" variant="secondary">
                다시 동기화
              </Button>
            ) : null}
            <LinkButton href={`/calendar/${event.id}`} size="sm" variant="secondary">
              보기
            </LinkButton>
            <LinkButton href={`/calendar/${event.id}/edit`} size="sm" variant="secondary">
              수정
            </LinkButton>
            <Button onClick={onDelete} size="sm" variant="danger">
              삭제
            </Button>
          </div>
        </div>

        {event.location || event.onlineUrl || event.memo || event.syncFailureReason ? (
          <div className="grid gap-1 text-caption text-neutral-600">
            {event.location ? <p>장소: {event.location}</p> : null}
            {event.onlineUrl ? (
              <a
                className="break-all text-primary-600 underline-offset-4 hover:underline"
                href={event.onlineUrl}
                rel="noreferrer"
                target="_blank"
              >
                {event.onlineUrl}
              </a>
            ) : null}
            {event.memo ? <p>{event.memo}</p> : null}
            {event.syncFailureReason ? (
              <p className="text-danger-700">동기화 실패 사유: {event.syncFailureReason}</p>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
}

export function sortRecruitmentEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((left, right) => {
    const byStartAt = left.startAt.getTime() - right.startAt.getTime();

    if (byStartAt !== 0) {
      return byStartAt;
    }

    return left.eventType.localeCompare(right.eventType) || Number(left.id) - Number(right.id);
  });
}

export function getTimelineEventState(
  event: CalendarEvent,
  baseDate: Date = new Date(),
): TimelineEventState {
  if (isSameDate(event.startAt, baseDate)) {
    return "today";
  }

  return event.endAt.getTime() < startOfDay(baseDate).getTime() ? "done" : "upcoming";
}

function eventStateLabel(state: TimelineEventState): string {
  if (state === "done") {
    return "완료";
  }

  if (state === "today") {
    return "오늘";
  }

  return "예정";
}

function eventStateVariant(state: TimelineEventState): "neutral" | "primary" | "success" {
  if (state === "done") {
    return "success";
  }

  if (state === "today") {
    return "primary";
  }

  return "neutral";
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function recruitmentEventTypeLabel(eventType: CalendarEventType): string {
  return CALENDAR_EVENT_TYPE_LABEL[eventType];
}
