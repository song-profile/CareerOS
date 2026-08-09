import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { ApplicationErrorState, ApplicationLoadingState } from "@/features/applications/components/application-list-states";
import { LazyApplicationList } from "@/features/applications/components/lazy-application-list";
import { fetchApplicationsForCurrentUser } from "@/features/applications/api/server-application-api";
import {
  parseApplicationListSearchParams,
  toApplicationQueryDto,
} from "@/features/applications/search-params";

interface ApplicationsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ApplicationsPage({ searchParams }: ApplicationsPageProps) {
  const params = await searchParams;
  const searchState = parseApplicationListSearchParams(params);
  const applicationsResult = await fetchApplicationsForCurrentUser(
    toApplicationQueryDto(searchState),
  );

  return (
    <>
      <PageHeader
        actions={<LinkButton href="/applications/new">지원 등록</LinkButton>}
        description="회사와 직무별 지원 건을 검색하고 상태와 마감순으로 빠르게 확인하세요."
        title="지원관리"
      />
      {applicationsResult.ok ? (
        <Suspense fallback={<ApplicationLoadingState />}>
          <LazyApplicationList applications={applicationsResult.value} searchState={searchState} />
        </Suspense>
      ) : (
        <ApplicationErrorState message={applicationsResult.message} />
      )}
    </>
  );
}
