"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils/cn";
import { fetchCalendarEvents } from "@/features/calendar/api/calendar-api";
import { WEEKDAY_LABELS } from "@/features/calendar/constants";
import {
  addMonths,
  buildCalendarMonthDays,
  formatEventDateTime,
  formatEventTime,
  formatMonthTitle,
  getDDayLabel,
  getEventsForDate,
  getCalendarGridRange,
  toDateKey,
} from "@/features/calendar/date-utils";
import { EventTypeBadge } from "@/features/calendar/components/event-type-badge";
import { CalendarEmptyState } from "@/features/calendar/components/calendar-states";
import type { CalendarEvent } from "@/features/calendar/types";

export interface CalendarBoardProps {
  events: CalendarEvent[];
  initialMonth: string;
  upcomingEvents: CalendarEvent[];
}

export function CalendarBoard({
  events: initialEvents,
  initialMonth,
  upcomingEvents,
}: CalendarBoardProps) {
  const [today] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialMonth));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [notice, setNotice] = useState("");

  const monthDays = useMemo(
    () => buildCalendarMonthDays(visibleMonth, today),
    [today, visibleMonth],
  );
  const selectedDate = useMemo(() => {
    const [year, month, day] = selectedDateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDateKey]);
  const selectedDateEvents = useMemo(
    () => getEventsForDate(events, selectedDate),
    [events, selectedDate],
  );
  const hasCurrentMonthEvents = monthDays.some(
    (day) => day.isCurrentMonth && getEventsForDate(events, day.date).length > 0,
  );

  async function loadMonth(month: Date) {
    setLoadingMonth(true);
    setNotice("");
    try {
      const range = getCalendarGridRange(month);
      const nextEvents = await fetchCalendarEvents({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });
      setEvents(nextEvents);
    } catch {
      setNotice("월간 일정을 불러올 수 없습니다.");
    } finally {
      setLoadingMonth(false);
    }
  }

  function moveMonth(months: number) {
    const nextMonth = addMonths(visibleMonth, months);
    setVisibleMonth(nextMonth);
    void loadMonth(nextMonth);
  }

  function moveToday() {
    const nextToday = new Date();
    setVisibleMonth(nextToday);
    setSelectedDateKey(toDateKey(nextToday));
    void loadMonth(nextToday);
  }

  if (events.length === 0) {
    return (
      <CalendarEmptyState
        actionHref="/calendar/new"
        description="지원 마감이나 면접 일정을 등록해보세요."
        title="아직 등록된 일정이 없습니다."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <CalendarHeader
              loading={loadingMonth}
              monthTitle={formatMonthTitle(visibleMonth)}
              onNext={() => moveMonth(1)}
              onPrev={() => moveMonth(-1)}
              onToday={moveToday}
            />
            {!hasCurrentMonthEvents ? (
              <p className="rounded-control bg-neutral-50 p-3 text-body text-neutral-600">
                이번 달에는 예정된 일정이 없습니다.
              </p>
            ) : null}
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-neutral-200 bg-neutral-200">
              {WEEKDAY_LABELS.map((weekday) => (
                <div
                  className="bg-neutral-50 px-2 py-2 text-center text-caption text-neutral-600"
                  key={weekday}
                >
                  {weekday}
                </div>
              ))}
              {monthDays.map((day) => (
                <CalendarDayCell
                  day={day}
                  events={getEventsForDate(events, day.date)}
                  key={day.key}
                  selected={day.key === selectedDateKey}
                  onSelect={() => setSelectedDateKey(day.key)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <SelectedDatePanel dateKey={selectedDateKey} events={selectedDateEvents} />
        <UpcomingEventList events={upcomingEvents} />
      </div>

      {notice ? <Toast tone="error">{notice}</Toast> : null}
    </div>
  );
}

function CalendarHeader({
  loading,
  monthTitle,
  onNext,
  onPrev,
  onToday,
}: {
  loading: boolean;
  monthTitle: string;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-h1 text-neutral-900">{monthTitle}</h2>
      <div className="grid grid-cols-3 gap-2 sm:flex">
        <Button
          aria-label="이전 달 보기"
          disabled={loading}
          onClick={onPrev}
          size="sm"
          variant="secondary"
        >
          이전
        </Button>
        <Button disabled={loading} onClick={onToday} size="sm" variant="secondary">
          {loading ? "불러오는 중" : "오늘"}
        </Button>
        <Button
          aria-label="다음 달 보기"
          disabled={loading}
          onClick={onNext}
          size="sm"
          variant="secondary"
        >
          다음
        </Button>
      </div>
    </div>
  );
}

function CalendarDayCell({
  day,
  events,
  onSelect,
  selected,
}: {
  day: ReturnType<typeof buildCalendarMonthDays>[number];
  events: CalendarEvent[];
  onSelect: () => void;
  selected: boolean;
}) {
  const visibleEvents = events.slice(0, 2);
  const hiddenCount = events.length - visibleEvents.length;

  return (
    <div
      className={cn(
        "min-h-24 bg-neutral-0 p-1.5 sm:min-h-32 sm:p-2",
        !day.isCurrentMonth && "bg-neutral-50 text-neutral-400",
        selected && "ring-2 ring-inset ring-primary-500",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <button
          aria-current={day.isToday ? "date" : undefined}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full text-caption font-medium",
            day.isToday ? "bg-primary-600 text-white" : "text-neutral-900 hover:bg-neutral-100",
          )}
          onClick={onSelect}
          type="button"
        >
          {day.dayOfMonth}
        </button>
        <Link
          aria-label={`${day.key}에 일정 등록`}
          className="rounded-control px-1.5 py-0.5 text-caption text-primary-600 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          href={`/calendar/new?date=${day.key}`}
        >
          등록
        </Link>
      </div>
      <div className="mt-1 grid gap-1">
        {visibleEvents.map((event) => (
          <Link
            className="truncate rounded-badge bg-primary-50 px-1.5 py-1 text-caption text-primary-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            href={`/calendar/${event.id}`}
            key={event.id}
            title={`${formatEventTime(event.startAt)} ${event.title}`}
          >
            {event.allDay ? "종일" : formatEventTime(event.startAt)} {event.title}
          </Link>
        ))}
        {hiddenCount > 0 ? (
          <span className="text-caption text-neutral-600">외 {hiddenCount}개</span>
        ) : null}
      </div>
    </div>
  );
}

function SelectedDatePanel({ dateKey, events }: { dateKey: string; events: CalendarEvent[] }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h3 text-neutral-900">선택한 날짜</h2>
            <LinkButton href={`/calendar/new?date=${dateKey}`} size="sm">
              일정 등록
            </LinkButton>
          </div>
          <p className="font-mono text-mono text-neutral-600">{dateKey}</p>
          {events.length > 0 ? (
            <ul className="grid gap-2">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    className="grid gap-1 rounded-control border border-neutral-200 p-3 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    href={`/calendar/${event.id}`}
                  >
                    <span className="text-body-medium text-neutral-900">{event.title}</span>
                    <span className="font-mono text-mono text-neutral-600">
                      {event.allDay ? "종일" : formatEventTime(event.startAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-neutral-600">선택한 날짜에는 일정이 없습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingEventList({ events }: { events: CalendarEvent[] }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <h2 className="text-h3 text-neutral-900">다가오는 일정</h2>
          {events.length > 0 ? (
            <ul className="grid gap-3">
              {events.map((event) => (
                <li className="grid gap-2 rounded-control border border-neutral-200 p-3" key={event.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge eventType={event.eventType} />
                    <span className="text-caption text-primary-700">{getDDayLabel(event.startAt)}</span>
                  </div>
                  <div className="grid gap-1">
                    <p className="break-words text-body-medium text-neutral-900">{event.title}</p>
                    <p className="font-mono text-mono text-neutral-600">
                      {formatEventDateTime(event.startAt)}
                    </p>
                    <p className="text-body text-neutral-600">
                      {event.companyName ? `${event.companyName} ${event.positionName}` : "개인 일정"}
                    </p>
                    <p className="text-body text-neutral-600">
                      {event.onlineUrl ? "온라인" : event.location || "장소 미입력"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {event.applicationId ? (
                      <LinkButton
                        href={`/applications/${event.applicationId}`}
                        size="sm"
                        variant="secondary"
                      >
                        지원 건
                      </LinkButton>
                    ) : null}
                    <LinkButton href={`/calendar/${event.id}`} size="sm" variant="secondary">
                      상세보기
                    </LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-neutral-600">다가오는 일정이 없습니다.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
