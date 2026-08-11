import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { ApplicationErrorState, ApplicationLoadingState } from "@/features/applications/components/application-list-states";
import { ApplicationKanbanBoard } from "@/features/applications/components/application-kanban-board";
import { LazyApplicationList } from "@/features/applications/components/lazy-application-list";
import { fetchApplicationsForCurrentUser } from "@/features/applications/api/server-application-api";
import { toNextScheduleByApplicationId } from "@/features/applications/kanban-utils";
import { APPLICATION_VIEW_OPTIONS } from "@/features/applications/list-utils";
import {
  buildApplicationListHref,
  parseApplicationListSearchParams,
  toApplicationQueryDto,
  type ApplicationListSearchState,
} from "@/features/applications/search-params";
import { getCalendarEvents } from "@/features/calendar/calendar-service";

/** 다음 일정은 카드당 1개만 쓰지만, 어느 지원 건 것이 섞여 올지 모르니 백엔드 상한까지 받는다. */
const UPCOMING_EVENT_LIMIT = 100;

interface ApplicationsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const params = await searchParams;
  const searchState = parseApplicationListSearchParams(params);
  const isKanban = searchState.view === "kanban";
  const [applicationsResult, upcomingResult] = await Promise.all([
    fetchApplicationsForCurrentUser(toApplicationQueryDto(searchState)),
    isKanban ? getCalendarEvents({ upcoming: true, limit: UPCOMING_EVENT_LIMIT }) : undefined,
  ]);

  return (
    <>
      <PageHeader
        actions={
          <>
            <ApplicationViewToggle searchState={searchState} />
            <LinkButton href="/applications/new">지원 등록</LinkButton>
          </>
        }
        description={
          isKanban
            ? "전형 상태별로 지원 건을 보고, 카드를 옮겨 상태를 변경하세요."
            : "회사와 직무별 지원 건을 검색하고 상태와 마감순으로 빠르게 확인하세요."
        }
        title="지원관리"
      />
      {applicationsResult.ok ? (
        <Suspense fallback={<ApplicationLoadingState />}>
          {isKanban ? (
            <ApplicationKanbanBoard
              applications={applicationsResult.value}
              // 일정 조회가 실패해도 칸반 자체는 보여준다. 다음 일정만 비는 편이 낫다.
              nextSchedules={
                upcomingResult?.ok ? toNextScheduleByApplicationId(upcomingResult.value) : {}
              }
              searchState={searchState}
            />
          ) : (
            <LazyApplicationList applications={applicationsResult.value} searchState={searchState} />
          )}
        </Suspense>
      ) : (
        <ApplicationErrorState message={applicationsResult.message} />
      )}
    </>
  );
}

function ApplicationViewToggle({ searchState }: { searchState: ApplicationListSearchState }) {
  return (
    <div
      aria-label="보기 전환"
      className="flex items-center gap-1 rounded-control border border-neutral-200 p-1"
      role="group"
    >
      {APPLICATION_VIEW_OPTIONS.map((option) => (
        <LinkButton
          aria-current={searchState.view === option.value ? "page" : undefined}
          href={buildApplicationListHref({ ...searchState, view: option.value })}
          key={option.value}
          size="sm"
          variant={searchState.view === option.value ? "primary" : "ghost"}
        >
          {option.label}
        </LinkButton>
      ))}
    </div>
  );
}
