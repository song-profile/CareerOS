"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import type { ApplicationListItem } from "@/features/applications/types";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/features/calendar/api/calendar-api";
import {
  CALENDAR_EVENT_TYPE_LABEL,
  CALENDAR_EVENT_TYPES,
  DEFAULT_REMINDER_RULES,
  REMINDER_PRESET_OPTIONS,
} from "@/features/calendar/constants";
import { isHttpsCalendarUrl, toDateInputValue, toTimeInputValue } from "@/features/calendar/form-utils";
import type {
  CalendarEvent,
  CalendarEventFormErrors,
  CalendarEventFormValues,
  CalendarEventType,
  CalendarReminderRule,
  CalendarRouteSearchParams,
} from "@/features/calendar/types";
import { CALENDAR_EVENT_MEMO_MAX_LENGTH } from "@/features/calendar/types";

export interface EventFormProps {
  applications: ApplicationListItem[];
  event?: CalendarEvent;
  mode: "create" | "edit";
  searchParams?: CalendarRouteSearchParams;
}

export function EventForm({ applications, event, mode, searchParams }: EventFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CalendarEventFormValues>(() =>
    buildInitialValues(event, searchParams),
  );
  const [errors, setErrors] = useState<CalendarEventFormErrors>({});
  const [applicationQuery, setApplicationQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error" | "info">("info");

  const filteredApplications = useMemo(() => {
    const normalizedQuery = applicationQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return applications;
    }

    return applications.filter((application) =>
      [application.companyName, application.position].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [applicationQuery, applications]);

  const selectedApplication = applications.find(
    (application) => application.id === values.applicationId,
  );

  function updateField<TKey extends keyof CalendarEventFormValues>(
    key: TKey,
    value: CalendarEventFormValues[TKey],
  ) {
    setValues((current) => {
      const nextValues = { ...current, [key]: value };

      if (key === "applicationId") {
        const nextApplication = applications.find((application) => application.id === value);

        if (nextApplication && !current.title.trim()) {
          nextValues.title = `[${CALENDAR_EVENT_TYPE_LABEL[current.eventType]}] ${nextApplication.companyName} · ${nextApplication.position}`;
        }
      }

      if (key === "eventType" && selectedApplication && !current.title.trim()) {
        nextValues.title = `[${CALENDAR_EVENT_TYPE_LABEL[value as CalendarEventType]}] ${selectedApplication.companyName} · ${selectedApplication.position}`;
      }

      return nextValues;
    });
  }

  function showNotice(message: string, tone: "success" | "error" | "info" = "info") {
    setNotice(message);
    setNoticeTone(tone);
  }

  async function handleSubmit(eventParam: FormEvent<HTMLFormElement>) {
    eventParam.preventDefault();
    const nextErrors = validateEventForm(values);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    try {
      const savedEvent =
        mode === "create"
          ? await createCalendarEvent(values)
          : await updateCalendarEvent(event?.id ?? "", values);
      showNotice(mode === "create" ? "일정을 등록했습니다." : "일정을 수정했습니다.", "success");
      router.push(`/calendar/${savedEvent.id}`);
      router.refresh();
    } catch {
      showNotice(
        mode === "create" ? "일정 등록에 실패했습니다." : "일정 수정에 실패했습니다.",
        "error",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      {notice ? <Toast tone={noticeTone}>{notice}</Toast> : null}

      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                errorMessage={errors.eventType}
                label="일정 유형"
                onChange={(changeEvent) =>
                  updateField("eventType", changeEvent.target.value as CalendarEventType)
                }
                options={CALENDAR_EVENT_TYPES.map((eventType) => ({
                  label: CALENDAR_EVENT_TYPE_LABEL[eventType],
                  value: eventType,
                }))}
                required
                value={values.eventType}
              />
              <Input
                errorMessage={errors.title}
                label="일정 제목"
                onChange={(changeEvent) => updateField("title", changeEvent.target.value)}
                placeholder="[지원 마감] KB국민은행 · IT 개발"
                required
                value={values.title}
              />
            </div>

            <ApplicationSelect
              applications={filteredApplications}
              errorMessage={errors.applicationId}
              onQueryChange={setApplicationQuery}
              onSelect={(applicationId) => updateField("applicationId", applicationId)}
              query={applicationQuery}
              selectedApplicationId={values.applicationId}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                errorMessage={errors.startDate}
                label="시작일"
                onChange={(changeEvent) => updateField("startDate", changeEvent.target.value)}
                required
                type="date"
                value={values.startDate}
              />
              <Input
                disabled={values.allDay}
                errorMessage={errors.startTime}
                label="시작시간"
                onChange={(changeEvent) => updateField("startTime", changeEvent.target.value)}
                required={!values.allDay}
                type="time"
                value={values.startTime}
              />
              <Input
                errorMessage={errors.endDate}
                label="종료일"
                onChange={(changeEvent) => updateField("endDate", changeEvent.target.value)}
                type="date"
                value={values.endDate}
              />
              <Input
                disabled={values.allDay}
                errorMessage={errors.endTime}
                label="종료시간"
                onChange={(changeEvent) => updateField("endTime", changeEvent.target.value)}
                type="time"
                value={values.endTime}
              />
            </div>

            <label className="flex items-center gap-2 text-body-medium text-neutral-900">
              <input
                checked={values.allDay}
                className="h-4 w-4"
                onChange={(changeEvent) => updateField("allDay", changeEvent.target.checked)}
                type="checkbox"
              />
              종일 일정
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="장소"
                onChange={(changeEvent) => updateField("location", changeEvent.target.value)}
                placeholder="서울 강남구 또는 온라인"
                value={values.location}
              />
              <Input
                errorMessage={errors.onlineUrl}
                helperText="온라인 링크가 있으면 http 또는 https URL로 입력해 주세요."
                label="온라인 URL"
                onChange={(changeEvent) => updateField("onlineUrl", changeEvent.target.value)}
                placeholder="https://meet.example.com"
                type="url"
                value={values.onlineUrl}
              />
            </div>

            <Textarea
              errorMessage={errors.memo}
              helperText={`${values.memo.length}/${CALENDAR_EVENT_MEMO_MAX_LENGTH}자`}
              label="메모"
              onChange={(changeEvent) => updateField("memo", changeEvent.target.value)}
              resize="vertical"
              value={values.memo}
            />
          </div>
        </CardContent>
      </Card>

      <ReminderRuleEditor
        errorMessage={errors.reminderRules}
        onChange={(reminderRules) => updateField("reminderRules", reminderRules)}
        onEnabledChange={(enabled) => updateField("remindersEnabled", enabled)}
        reminderRules={values.reminderRules}
        remindersEnabled={values.remindersEnabled}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-control border border-neutral-200 bg-neutral-0 px-4 text-body-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          href={event ? `/calendar/${event.id}` : "/calendar"}
        >
          취소
        </Link>
        <Button disabled={submitting} loading={submitting} type="submit">
          저장
        </Button>
      </div>
    </form>
  );
}

function ApplicationSelect({
  applications,
  errorMessage,
  onQueryChange,
  onSelect,
  query,
  selectedApplicationId,
}: {
  applications: ApplicationListItem[];
  errorMessage?: string;
  onQueryChange: (query: string) => void;
  onSelect: (applicationId: string) => void;
  query: string;
  selectedApplicationId: string;
}) {
  return (
    <div className="grid gap-2">
      <Input
        errorMessage={errorMessage}
        helperText="회사명 또는 직무명으로 검색합니다. 개인 일정은 선택하지 않아도 됩니다."
        label="연결할 지원 건"
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="회사명 또는 직무"
        type="search"
        value={query}
      />
      <div className="grid max-h-72 gap-2 overflow-y-auto rounded-card border border-neutral-200 p-2">
        <button
          className="rounded-control border border-neutral-200 px-3 py-2 text-left text-body text-neutral-900 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onClick={() => onSelect("")}
          type="button"
        >
          개인 일정으로 등록
        </button>
        {applications.length > 0 ? (
          applications.map((application) => (
            <button
              className={`grid gap-2 rounded-control border px-3 py-2 text-left hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                selectedApplicationId === application.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200"
              }`}
              key={application.id}
              onClick={() => onSelect(application.id)}
              type="button"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-medium text-neutral-900">
                  {application.companyName} · {application.position}
                </span>
                <ApplicationStatusBadge status={application.status} />
              </div>
              <span className="text-caption text-neutral-600">
                {application.recruitmentYear} {application.season}
              </span>
            </button>
          ))
        ) : (
          <p className="p-3 text-body text-neutral-600">
            먼저 지원 건을 등록하면 일정과 연결할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}

function ReminderRuleEditor({
  errorMessage,
  onChange,
  onEnabledChange,
  reminderRules,
  remindersEnabled,
}: {
  errorMessage?: string;
  onChange: (rules: CalendarReminderRule[]) => void;
  onEnabledChange: (enabled: boolean) => void;
  reminderRules: CalendarReminderRule[];
  remindersEnabled: boolean;
}) {
  function addReminder(minutesBefore: number) {
    if (reminderRules.some((rule) => rule.minutesBefore === minutesBefore)) {
      return;
    }

    onChange([
      ...reminderRules,
      {
        id: `reminder-${minutesBefore}`,
        minutesBefore,
        enabled: true,
        channel: "INTERNAL",
      },
    ]);
  }

  function removeReminder(ruleId: string) {
    onChange(reminderRules.filter((rule) => rule.id !== ruleId));
  }

  return (
    <Card>
      <CardContent>
        <div className="grid gap-4">
          <label className="flex items-center gap-2 text-body-medium text-neutral-900">
            <input
              checked={remindersEnabled}
              className="h-4 w-4"
              onChange={(event) => onEnabledChange(event.target.checked)}
              type="checkbox"
            />
            알림 사용
          </label>

          {remindersEnabled ? (
            <>
              <div className="flex flex-wrap gap-2">
                {REMINDER_PRESET_OPTIONS.map((option) => (
                  <Button
                    disabled={reminderRules.some(
                      (rule) => rule.minutesBefore === option.minutesBefore,
                    )}
                    key={option.minutesBefore}
                    onClick={() => addReminder(option.minutesBefore)}
                    size="sm"
                    variant="secondary"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <ul className="grid gap-2">
                {reminderRules.map((rule) => (
                  <li
                    className="flex flex-col gap-2 rounded-control border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                    key={rule.id}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={rule.enabled ? "success" : "neutral"}>
                        {rule.enabled ? "사용" : "꺼짐"}
                      </Badge>
                      <span className="text-body text-neutral-900">
                        {formatReminderRule(rule.minutesBefore)}
                      </span>
                      <span className="text-caption text-neutral-600">{rule.channel}</span>
                    </div>
                    <Button onClick={() => removeReminder(rule.id)} size="sm" variant="danger">
                      삭제
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-body text-neutral-600">이 일정의 알림이 꺼져 있습니다.</p>
          )}
          {errorMessage ? <p className="text-caption text-danger-600">{errorMessage}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function buildInitialValues(
  event?: CalendarEvent,
  searchParams?: CalendarRouteSearchParams,
): CalendarEventFormValues {
  if (event) {
    return {
      eventType: event.eventType,
      title: event.title,
      applicationId: event.applicationId ?? "",
      startDate: toDateInputValue(event.startAt),
      startTime: toTimeInputValue(event.startAt),
      endDate: toDateInputValue(event.endAt),
      endTime: toTimeInputValue(event.endAt),
      allDay: event.allDay,
      location: event.location,
      onlineUrl: event.onlineUrl,
      memo: event.memo,
      remindersEnabled: event.reminderRules.some((rule) => rule.enabled),
      reminderRules: event.reminderRules,
    };
  }

  const initialDate = searchParams?.date ?? toDateInputValue(new Date());

  return {
    ...emptyFormValues(),
    eventType: searchParams?.eventType ?? "APPLICATION_DEADLINE",
    applicationId: searchParams?.applicationId ?? "",
    startDate: initialDate,
    endDate: initialDate,
  };
}

function emptyFormValues(): CalendarEventFormValues {
  return {
    eventType: "APPLICATION_DEADLINE",
    title: "",
    applicationId: "",
    startDate: toDateInputValue(new Date()),
    startTime: "09:00",
    endDate: toDateInputValue(new Date()),
    endTime: "10:00",
    allDay: false,
    location: "",
    onlineUrl: "",
    memo: "",
    remindersEnabled: true,
    reminderRules: DEFAULT_REMINDER_RULES,
  };
}

function validateEventForm(values: CalendarEventFormValues): CalendarEventFormErrors {
  const errors: CalendarEventFormErrors = {};

  if (!values.eventType) {
    errors.eventType = "일정 유형을 선택해 주세요.";
  }

  if (!values.title.trim()) {
    errors.title = "일정 제목을 입력해 주세요.";
  }

  if (!values.startDate) {
    errors.startDate = "시작일을 입력해 주세요.";
  }

  if (!values.allDay && !values.startTime) {
    errors.startTime = "시작시간을 입력해 주세요.";
  }

  if (values.endDate && values.startDate && values.endDate < values.startDate) {
    errors.endDate = "종료일은 시작일보다 이전일 수 없습니다.";
  }

  if (
    !values.allDay &&
    values.startDate &&
    values.endDate &&
    values.startDate === values.endDate &&
    values.endTime &&
    values.startTime &&
    values.endTime < values.startTime
  ) {
    errors.endTime = "종료시간은 시작시간보다 이전일 수 없습니다.";
  }

  if (values.onlineUrl.trim() && !isHttpsCalendarUrl(values.onlineUrl.trim())) {
    errors.onlineUrl = "https로 시작하는 올바른 URL을 입력해 주세요.";
  }

  if (values.memo.length > CALENDAR_EVENT_MEMO_MAX_LENGTH) {
    errors.memo = `메모는 ${CALENDAR_EVENT_MEMO_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (values.reminderRules.some((rule) => rule.minutesBefore < 0)) {
    errors.reminderRules = "알림 시간은 음수일 수 없습니다.";
  }

  const uniqueMinutes = new Set(values.reminderRules.map((rule) => rule.minutesBefore));
  if (uniqueMinutes.size !== values.reminderRules.length) {
    errors.reminderRules = "같은 알림 규칙을 중복으로 추가할 수 없습니다.";
  }

  return errors;
}

export function formatReminderRule(minutesBefore: number): string {
  const preset = REMINDER_PRESET_OPTIONS.find((option) => option.minutesBefore === minutesBefore);

  if (preset) {
    return preset.label;
  }

  if (minutesBefore >= 24 * 60) {
    return `${Math.round(minutesBefore / (24 * 60))}일 전`;
  }

  return `${Math.round(minutesBefore / 60)}시간 전`;
}
