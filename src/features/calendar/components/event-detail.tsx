"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { LinkButton } from "@/components/ui/link-button";
import {
  formatEventDateTime,
  getDDayLabel,
} from "@/features/calendar/date-utils";
import { EventTypeBadge } from "@/features/calendar/components/event-type-badge";
import { formatReminderRule } from "@/features/calendar/components/event-form";
import type { CalendarEvent } from "@/features/calendar/types";

export function EventDetail({ event }: { event: CalendarEvent }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const syncStatus = event.syncStatus ?? "NOT_CONNECTED";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div className="grid gap-6">
        <Card variant="highlight">
          <CardContent>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <EventTypeBadge eventType={event.eventType} />
                  <Badge variant="neutral">{getDDayLabel(event.startAt)}</Badge>
                  <Badge variant="neutral">Google Calendar 연동 전</Badge>
                </div>
                <div className="grid gap-1">
                  <h2 className="break-words text-display text-neutral-900">{event.title}</h2>
                  <p className="text-body text-neutral-600">
                    {event.companyName
                      ? `${event.companyName} · ${event.positionName}`
                      : "개인 준비 일정"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                <LinkButton href="/calendar" variant="secondary">
                  캘린더로
                </LinkButton>
                <LinkButton href={`/calendar/${event.id}/edit`}>수정</LinkButton>
                <Button onClick={() => setDeleteOpen(true)} variant="danger">
                  삭제
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <DetailSection title="일정 정보">
          <dl className="grid gap-4">
            <DetailRow label="시작" value={formatEventDateTime(event.startAt)} />
            <DetailRow label="종료" value={formatEventDateTime(event.endAt)} />
            <DetailRow label="종일 여부" value={event.allDay ? "종일 일정" : "시간 지정"} />
            <DetailRow label="장소" value={event.location || "장소 미입력"} />
            <DetailRow
              label="온라인 링크"
              value={
                event.onlineUrl ? (
                  <a
                    className="break-all text-primary-600 underline-offset-4 hover:underline"
                    href={event.onlineUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {event.onlineUrl}
                  </a>
                ) : (
                  "온라인 링크 없음"
                )
              }
            />
            <DetailRow label="메모" value={event.memo || "등록된 메모가 없습니다."} />
          </dl>
        </DetailSection>

        <DetailSection title="알림 규칙">
          {event.reminderRules.length > 0 ? (
            <ul className="grid gap-2">
              {event.reminderRules.map((rule) => (
                <li
                  className="flex flex-wrap items-center gap-2 rounded-control border border-neutral-200 p-3"
                  key={rule.id}
                >
                  <Badge variant={rule.enabled ? "success" : "neutral"}>
                    {rule.enabled ? "사용" : "꺼짐"}
                  </Badge>
                  <span className="text-body text-neutral-900">
                    {formatReminderRule(rule.minutesBefore)}
                  </span>
                  <span className="text-caption text-neutral-600">{rule.channel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body text-neutral-600">등록된 알림 규칙이 없습니다.</p>
          )}
        </DetailSection>

        <DetailSection title="체크리스트">
          <p className="text-body text-neutral-600">
            체크리스트는 다음 단계에서 제공됩니다. 일정 유형별 준비 항목을 연결할 예정입니다.
          </p>
        </DetailSection>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-h3 text-neutral-900">연결 정보</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <DetailRow
              label="지원 건"
              value={
                event.applicationId ? (
                  <LinkButton href={`/applications/${event.applicationId}`} size="sm" variant="secondary">
                    지원 상세 보기
                  </LinkButton>
                ) : (
                  "연결된 지원 건이 없습니다."
                )
              }
            />
            <DetailRow label="동기화 상태" value={syncStatus} />
            <DetailRow label="Google Event ID" value={event.googleEventId ?? "연동 전"} />
          </div>
        </CardContent>
      </Card>

      {deleteOpen ? (
        <DeleteEventDialog eventTitle={event.title} onClose={() => setDeleteOpen(false)} />
      ) : null}
    </div>
  );
}

function DeleteEventDialog({
  eventTitle,
  onClose,
}: {
  eventTitle: string;
  onClose: () => void;
}) {
  const [notice, setNotice] = useState("");

  return (
    <Dialog
      description={
        <p className="break-words">
          {eventTitle} 일정을 삭제하면 복구할 수 없습니다. 이번 단계에서는 실제 데이터가 삭제되지 않습니다.
        </p>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            취소
          </Button>
          <Button
            onClick={() => setNotice("삭제 API 연동 전입니다. 실제 일정은 삭제되지 않습니다.")}
            variant="danger"
          >
            삭제 확인
          </Button>
        </div>
      }
      onClose={onClose}
      title="일정 삭제"
    >
        {notice ? <p className="text-body-medium text-primary-700">{notice}</p> : null}
    </Dialog>
  );
}

function DetailSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3 text-neutral-900">{title}</h2>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-body-medium text-neutral-600">{label}</dt>
      <dd className="break-words text-body text-neutral-900">{value}</dd>
    </div>
  );
}
