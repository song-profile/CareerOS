"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ApplicationDDayChip } from "@/features/applications/components/application-d-day-chip";
import { ApplicationEmptyState } from "@/features/applications/components/application-list-states";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { formatDeadline } from "@/features/applications/date-utils";
import {
  APPLICATION_SORT_OPTIONS,
  APPLICATION_STATUS_FILTERS,
  sortApplications,
} from "@/features/applications/list-utils";
import {
  buildApplicationListHref,
  toApplicationListSearchState,
  type ApplicationListSearchState,
} from "@/features/applications/search-params";
import type {
  ApplicationListItem,
  ApplicationSortKey,
  ApplicationStatusFilter,
} from "@/features/applications/types";

interface ApplicationListProps {
  applications: ApplicationListItem[];
  searchState: ApplicationListSearchState;
}

export function ApplicationList({ applications, searchState }: ApplicationListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(searchState.keyword);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>(searchState.status);
  const [sortKey, setSortKey] = useState<ApplicationSortKey>(searchState.sort);

  const visibleApplications = useMemo(() => {
    return sortApplications(applications, sortKey);
  }, [applications, sortKey]);

  function navigate(nextState: ApplicationListSearchState) {
    setSearchQuery(nextState.keyword);
    setStatusFilter(nextState.status);
    setSortKey(nextState.sort);

    startTransition(() => {
      router.push(buildApplicationListHref(nextState));
    });
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(toApplicationListSearchState({ keyword: searchQuery }, searchState));
  }

  function handleStatusChange(nextStatus: ApplicationStatusFilter) {
    navigate(toApplicationListSearchState({ keyword: searchQuery, status: nextStatus }, searchState));
  }

  function handleSortChange(nextSort: ApplicationSortKey) {
    navigate(toApplicationListSearchState({ keyword: searchQuery, sort: nextSort }, searchState));
  }

  return (
    <div className="grid gap-6">
      {searchState.deleted ? (
        <div
          className="fixed bottom-6 left-6 right-6 z-50 rounded-card border border-success-100 bg-success-50 px-4 py-3 text-body-medium text-success-700 shadow-lg sm:left-auto sm:w-[360px]"
          role="status"
        >
          지원 건을 삭제했습니다.
        </div>
      ) : null}

      <Card>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSearchSubmit}>
            <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Input
                  helperText="회사명, 직무명, 메모를 서버 API에서 검색합니다."
                  label="검색"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="회사명, 직무명"
                  type="search"
                  value={searchQuery}
                />
                <Button className="w-full sm:w-auto" loading={isPending} type="submit" variant="secondary">
                  검색
                </Button>
              </div>
              <div className="grid gap-1.5">
                <p className="text-body-medium text-neutral-900">정렬</p>
                <div className="flex flex-wrap gap-2">
                  {APPLICATION_SORT_OPTIONS.map((option) => (
                    <Button
                      aria-pressed={sortKey === option.value}
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      size="sm"
                      variant={sortKey === option.value ? "primary" : "secondary"}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <p className="text-body-medium text-neutral-900">상태 필터</p>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STATUS_FILTERS.map((filter) => (
                  <Button
                    aria-pressed={statusFilter === filter}
                    key={filter}
                    onClick={() => handleStatusChange(filter)}
                    size="sm"
                    variant={statusFilter === filter ? "primary" : "secondary"}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            <p className="text-caption text-neutral-600">
              총 {visibleApplications.length}건의 지원 건을 표시합니다.
              {isPending ? " 새 조건을 불러오는 중입니다." : ""}
            </p>
          </form>
        </CardContent>
      </Card>

      {visibleApplications.length > 0 ? (
        <>
          <ApplicationTable applications={visibleApplications} />
          <ApplicationMobileList applications={visibleApplications} />
        </>
      ) : (
        <ApplicationEmptyState />
      )}
    </div>
  );
}

function ApplicationTable({ applications }: { applications: ApplicationListItem[] }) {
  return (
    <Card className="hidden overflow-hidden lg:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-caption text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">회사</th>
              <th className="px-4 py-3 font-medium">직무</th>
              <th className="px-4 py-3 font-medium">채용시기</th>
              <th className="px-4 py-3 font-medium">마감일</th>
              <th className="px-4 py-3 font-medium">D-Day</th>
              <th className="px-4 py-3 font-medium">현재상태</th>
              <th className="min-w-44 px-4 py-3 font-medium">완성도</th>
              <th className="px-4 py-3 font-medium">더보기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {applications.map((application) => (
              <tr className="hover:bg-neutral-50" key={application.id}>
                <td className="px-4 py-4 text-body-medium text-neutral-900">{application.companyName}</td>
                <td className="px-4 py-4 text-body text-neutral-600">{application.position}</td>
                <td className="px-4 py-4">
                  <Badge>
                    {application.recruitmentYear} {application.season}
                  </Badge>
                </td>
                <td className="px-4 py-4 font-mono text-mono text-neutral-600">
                  {formatDeadline(application.deadline)}
                </td>
                <td className="px-4 py-4">
                  <ApplicationDDayChip deadline={application.deadline} />
                </td>
                <td className="px-4 py-4">
                  <ApplicationStatusBadge status={application.status} />
                </td>
                <td className="px-4 py-4">
                  <ProgressBar label="지원서 완성도" value={application.progress} />
                </td>
                <td className="px-4 py-4">
                  <LinkButton href={`/applications/${application.id}`} size="sm" variant="secondary">
                    상세 보기
                  </LinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ApplicationMobileList({ applications }: { applications: ApplicationListItem[] }) {
  return (
    <div className="grid gap-3 lg:hidden">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardContent>
            <article className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                  <p className="text-body-medium text-neutral-900">{application.companyName}</p>
                  <p className="text-body text-neutral-600">{application.position}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ApplicationDDayChip deadline={application.deadline} />
                  <ApplicationStatusBadge status={application.status} />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    {application.recruitmentYear} {application.season}
                  </Badge>
                  <span className="font-mono text-mono text-neutral-600">
                    {formatDeadline(application.deadline)}
                  </span>
                </div>
                <ProgressBar label="지원서 완성도" value={application.progress} />
              </div>

              <LinkButton className="w-full sm:w-fit" href={`/applications/${application.id}`} size="sm" variant="secondary">
                상세 보기
              </LinkButton>
            </article>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
