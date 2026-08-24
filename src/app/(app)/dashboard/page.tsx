import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DeadlineCard } from "@/features/dashboard/components/deadline-card";
import {
  DashboardErrorState,
  DashboardEmptyState,
  DashboardSection,
} from "@/features/dashboard/components/dashboard-section";
import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { UpcomingEvents } from "@/features/dashboard/components/upcoming-events";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
import { CALENDAR_EVENT_TYPE_LABEL } from "@/features/calendar/constants";
import { getDashboardSummary } from "@/features/dashboard/dashboard-service";
import { getDDayLabel } from "@/features/dashboard/date-utils";
import { getUserProfileForCurrentUser } from "@/features/materials/api/server-materials-api";
import type {
  DashboardData,
  DashboardImportantNotification,
  DashboardPreparationItem,
  DashboardUpcomingEvent,
} from "@/features/dashboard/types";
import { getNotificationTypeLabel } from "@/features/notifications/notification-utils";

export default async function DashboardPage() {
  const [authState, dashboardResult, profileResult] = await Promise.all([
    getCurrentUserFromSession(),
    getDashboardSummary(),
    getUserProfileForCurrentUser(),
  ]);
  const currentUserName = resolveDisplayName(
    profileResult.ok ? profileResult.value.name : undefined,
    authState.status === "authenticated" ? authState.user.name : undefined,
  );

  return (
    <>
      <PageHeader
        actions={
          <>
            <LinkButton href="/applications" variant="secondary">
              지원 목록
            </LinkButton>
            <LinkButton href="/applications/new">지원 등록</LinkButton>
          </>
        }
        description={`${currentUserName}님, 마감, 일정, 작성 중인 지원서를 빠르게 확인하세요.`}
        title="대시보드"
      />

      {dashboardResult.ok ? (
        <DashboardContent dashboardData={dashboardResult.value} displayName={currentUserName} />
      ) : (
        <DashboardErrorState
          description={dashboardResult.message}
          title="대시보드를 불러올 수 없습니다."
        />
      )}
    </>
  );
}

function DashboardContent({
  dashboardData,
  displayName,
}: {
  dashboardData: DashboardData;
  displayName: string;
}) {
  const hasNoData =
    dashboardData.summary.weeklyDeadlineCount === 0 &&
    dashboardData.summary.upcomingEventCount === 0 &&
    dashboardData.summary.draftingApplicationCount === 0 &&
    dashboardData.upcomingDeadlines.length === 0 &&
    dashboardData.upcomingEvents.length === 0 &&
    dashboardData.preparationItems.length === 0;

  return (
    <>
      <DashboardSummary displayName={displayName} summary={dashboardData.summary} />
      {hasNoData ? <DashboardOnboardingEmptyState /> : null}

      <TodayEvents events={dashboardData.todayEvents} />
      <DashboardGoogleCalendarStatus dashboardData={dashboardData} />
      <QuickActions />
      <WeekEvents events={dashboardData.weekEvents} />
      <PreparationStatus items={dashboardData.preparationItems} />
      <ImportantNotifications notifications={dashboardData.importantNotifications} />

      <DashboardSection
        description="마감이 가까운 지원 건부터 확인하고 미완료 항목을 처리하세요."
        title="임박한 지원 마감"
      >
        {dashboardData.upcomingDeadlines.length === 0 ? (
          <DashboardEmptyState
            description="새 지원 건을 등록하면 마감이 가까운 순서로 보여드립니다."
            title="이번 주는 예정된 마감이 없습니다."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {dashboardData.upcomingDeadlines.map((deadline) => (
              <DeadlineCard deadline={deadline} key={deadline.applicationId} />
            ))}
          </div>
        )}
      </DashboardSection>

      <UpcomingEvents events={dashboardData.upcomingEvents} />
    </>
  );
}

function resolveDisplayName(profileName?: string, authName?: string): string {
  const normalizedProfileName = profileName?.trim();
  if (normalizedProfileName) {
    return normalizedProfileName;
  }

  const normalizedAuthName = authName?.trim();
  return normalizedAuthName || "사용자";
}

function DashboardOnboardingEmptyState() {
  return (
    <Card variant="highlight">
      <CardContent>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="grid gap-1">
            <h2 className="text-h2 text-neutral-900">첫 지원 일정을 만들어보세요</h2>
            <p className="text-body text-neutral-600">
              지원 건을 등록하면 마감 일정, 자소서, 제출자료 준비 상태가 대시보드에 모입니다.
            </p>
          </div>
          <LinkButton href="/applications/new">지원 추가</LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

function TodayEvents({ events }: { events: DashboardUpcomingEvent[] }) {
  return (
    <DashboardSection
      description="오늘 바로 확인해야 할 채용 일정을 시간순으로 보여드립니다."
      title="오늘의 일정"
    >
      {events.length === 0 ? (
        <DashboardEmptyState
          description="긴급한 일정이 없으면 이번 주 일정과 작성 중인 지원서를 점검하세요."
          title="오늘 예정된 채용 일정이 없습니다."
        />
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <EventRow event={event} emphasis="strong" key={event.id} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function WeekEvents({ events }: { events: DashboardUpcomingEvent[] }) {
  const groupedEvents = groupEventsByDate(events);

  return (
    <DashboardSection
      description="오늘부터 7일 안에 있는 마감, 테스트, 면접을 한눈에 확인합니다."
      title="이번 주 일정"
    >
      {groupedEvents.length === 0 ? (
        <DashboardEmptyState
          description="지원 건 마감이나 전형 일정을 추가하면 이곳에 주간 흐름으로 표시됩니다."
          title="이번 주 채용 일정이 없습니다."
        />
      ) : (
        <div className="grid gap-3">
          {groupedEvents.map((group) => (
            <div className="grid gap-2 sm:grid-cols-[84px_minmax(0,1fr)]" key={group.dateKey}>
              <div className="font-mono text-mono text-neutral-600">{group.label}</div>
              <div className="grid gap-2">
                {group.events.map((event) => (
                  <EventRow event={event} key={event.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function EventRow({
  emphasis = "normal",
  event,
}: {
  emphasis?: "normal" | "strong";
  event: DashboardUpcomingEvent;
}) {
  const daysUntil = getDaysUntilEvent(event.startsAt);
  const urgency = getUrgencyLabel(daysUntil);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={emphasis === "strong" ? "primary" : urgency.variant}>
                {event.allDay ? "종일" : formatTime(event.startsAt)}
              </Badge>
              <Badge variant={urgency.variant}>{urgency.label}</Badge>
              <span className="text-body-medium text-neutral-900">{event.title}</span>
            </div>
            <p className="text-body text-neutral-900">
              {event.companyName || "개인 일정"}
              {event.roleName ? ` · ${event.roleName}` : ""}
            </p>
            <p className="text-caption text-neutral-600">
              {event.location || CALENDAR_EVENT_TYPE_LABEL[event.type]}
            </p>
          </div>
          <LinkButton href={event.detailHref} size="sm" variant="secondary">
            일정 보기
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardGoogleCalendarStatus({ dashboardData }: { dashboardData: DashboardData }) {
  const status = dashboardData.googleCalendar;

  if (!status.connected) {
    return null;
  }

  if (status.failedCount === 0 && status.pendingCount === 0) {
    return (
      <div className="rounded-control border border-success-100 bg-success-50 px-4 py-3 text-body text-success-700">
        Google Calendar 모든 일정 동기화됨
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-control border border-danger-100 bg-danger-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body-medium text-danger-700">
        Google Calendar 동기화 확인 필요: 실패 {status.failedCount}개, 대기 {status.pendingCount}개
      </p>
      <LinkButton href="/settings/calendar" size="sm" variant="secondary">
        확인하기
      </LinkButton>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { href: "/applications/new", label: "지원 추가" },
    { href: "/calendar/new", label: "일정 추가" },
    { href: "/essays", label: "자소서 작성" },
    { href: "/materials", label: "자료 등록" },
  ];

  return (
    <nav aria-label="빠른 작업" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {actions.map((action, index) => (
        <LinkButton href={action.href} key={action.href} variant={index === 0 ? "primary" : "secondary"}>
          {action.label}
        </LinkButton>
      ))}
    </nav>
  );
}

function PreparationStatus({ items }: { items: DashboardPreparationItem[] }) {
  return (
    <DashboardSection
      description="지원건별 자소서, 연결 자료, 일정 수처럼 실제 계산 가능한 준비 상태만 보여드립니다."
      title="지원 준비 상태"
    >
      {items.length === 0 ? (
        <DashboardEmptyState
          description="진행 중인 지원 건을 등록하면 준비 상태를 요약해드립니다."
          title="점검할 지원 건이 없습니다."
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((item) => (
            <PreparationCard item={item} key={item.applicationId} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function PreparationCard({ item }: { item: DashboardPreparationItem }) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-body-medium text-neutral-900">{item.companyName}</p>
              <p className="text-body text-neutral-600">{item.roleName}</p>
            </div>
            {item.daysUntil === null ? (
              <Badge variant="neutral">마감 미정</Badge>
            ) : (
              <Badge variant={getUrgencyLabel(item.daysUntil).variant}>{getDDayLabel(item.daysUntil)}</Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="자소서" value={`${item.essayAnswerCount}/${item.essayQuestionCount}`} />
            <MiniStat label="자료" value={`${item.materialCount}개`} />
            <MiniStat label="일정" value={`${item.eventCount}개`} />
          </div>
          <LinkButton href={item.detailHref} size="sm" variant="secondary">
            지원 상세 보기
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

function ImportantNotifications({ notifications }: { notifications: DashboardImportantNotification[] }) {
  return (
    <DashboardSection
      description="마감, 면접, 코딩테스트, 동기화 실패처럼 놓치면 안 되는 알림만 일부 보여드립니다."
      title="중요 알림"
    >
      {notifications.length === 0 ? (
        <DashboardEmptyState
          description="읽지 않은 중요 알림이 생기면 이곳에 표시됩니다."
          title="확인할 중요 알림이 없습니다."
        />
      ) : (
        <div className="grid gap-2">
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </DashboardSection>
  );
}

function NotificationRow({ notification }: { notification: DashboardImportantNotification }) {
  return (
    <a
      className="grid gap-1 rounded-control border border-neutral-200 bg-neutral-0 p-3 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      href={notification.linkUrl ?? "/notifications"}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="primary">{getNotificationTypeLabel(notification.type)}</Badge>
        <span className="text-body-medium text-neutral-900">{notification.title}</span>
      </div>
      <p className="text-body text-neutral-600">{notification.message}</p>
    </a>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-control border border-neutral-200 bg-neutral-50 p-3">
      <span className="text-caption text-neutral-600">{label}</span>
      <span className="text-body-medium text-neutral-900">{value}</span>
    </div>
  );
}

function groupEventsByDate(events: DashboardUpcomingEvent[]) {
  const groups = new Map<string, DashboardUpcomingEvent[]>();

  events.forEach((event) => {
    const key = toDateKey(event.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), event]);
  });

  return [...groups.entries()].map(([dateKey, groupedEvents]) => ({
    dateKey,
    events: groupedEvents,
    label: formatDateLabel(groupedEvents[0].startsAt),
  }));
}

function getDaysUntilEvent(date: Date): number {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

function getUrgencyLabel(daysUntil: number): {
  label: string;
  variant: "danger" | "deadlineSoon" | "deadlineWeek" | "neutral" | "primary";
} {
  if (daysUntil <= 0) {
    return { label: "오늘", variant: "danger" };
  }

  if (daysUntil === 1) {
    return { label: "D-1", variant: "deadlineSoon" };
  }

  if (daysUntil <= 3) {
    return { label: "D-3 이내", variant: "deadlineWeek" };
  }

  if (daysUntil <= 7) {
    return { label: "이번 주", variant: "primary" };
  }

  return { label: "예정", variant: "neutral" };
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
