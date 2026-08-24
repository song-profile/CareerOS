"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toast } from "@/components/ui/toast";
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

export interface ApplicationListProps {
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
        <Toast tone="success">지원 건을 삭제했습니다.</Toast>
      ) : null}

      <Card>
        <CardContent className="p-4 sm:p-4">
          <form className="grid gap-4" onSubmit={handleSearchSubmit}>
            <div className="grid gap-3 xl:grid-cols-[minmax(260px,520px)_88px_minmax(0,1fr)] xl:items-start">
              <div className="grid gap-1.5">
                <Input
                  label="검색"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="회사명, 직무명, 메모"
                  type="search"
                  value={searchQuery}
                />
                <p className="text-caption text-neutral-600">회사명, 직무명, 메모에서 찾습니다.</p>
              </div>
              <Button className="w-full xl:mt-[26px] xl:w-[88px]" loading={isPending} type="submit" variant="secondary">
                검색
              </Button>
              <p className="hidden self-end justify-self-end pb-2 text-caption text-neutral-600 xl:block">
                총 <strong className="text-neutral-900">{visibleApplications.length}건</strong>
                {isPending ? " · 새 조건을 불러오는 중" : ""}
              </p>
            </div>

            <div className="grid gap-4 border-t border-neutral-200/70 pt-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
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

              <div className="grid gap-2 xl:min-w-[216px]">
                <p className="text-body-medium text-neutral-900">정렬</p>
                <div className="grid grid-cols-2 gap-2">
                  {APPLICATION_SORT_OPTIONS.map((option) => (
                    <Button
                      aria-pressed={sortKey === option.value}
                      className="w-full"
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

            <p className="text-caption text-neutral-600 sm:hidden">
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
    <DataTable
      columns={[
        { key: "company", header: "회사" },
        { key: "position", header: "직무" },
        { key: "season", header: "채용시기" },
        { key: "deadline", header: "마감일" },
        { key: "dday", header: "D-Day" },
        { key: "status", header: "현재상태" },
        { key: "progress", header: "완성도", className: "min-w-44" },
        { key: "detail", header: "더보기" },
      ]}
      getRowKey={(application) => application.id}
      items={applications}
      renderCell={(application, columnKey) => {
        switch (columnKey) {
          case "company":
            return <span className="text-body-medium text-neutral-900">{application.companyName}</span>;
          case "position":
            return <span className="text-body text-neutral-600">{application.position}</span>;
          case "season":
            return (
              <Badge>
                {application.recruitmentYear} {application.season}
              </Badge>
            );
          case "deadline":
            return <span className="font-mono text-mono text-neutral-600">{formatDeadline(application.deadline)}</span>;
          case "dday":
            return <ApplicationDDayChip deadline={application.deadline} />;
          case "status":
            return <ApplicationStatusBadge status={application.status} />;
          case "progress":
            return <ProgressBar label="지원서 완성도" value={application.progress} />;
          case "detail":
            return (
              <LinkButton href={`/applications/${application.id}`} size="sm" variant="secondary">
                상세 보기
              </LinkButton>
            );
          default:
            return null;
        }
      }}
    />
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
