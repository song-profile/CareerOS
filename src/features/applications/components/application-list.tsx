"use client";

import { useMemo, useState } from "react";
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
  filterApplications,
  sortApplications,
} from "@/features/applications/list-utils";
import type {
  ApplicationListItem,
  ApplicationSortKey,
  ApplicationStatusFilter,
} from "@/features/applications/types";

interface ApplicationListProps {
  applications: ApplicationListItem[];
}

export function ApplicationList({ applications }: ApplicationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusFilter>("전체");
  const [sortKey, setSortKey] = useState<ApplicationSortKey>("deadline");

  const visibleApplications = useMemo(() => {
    const filteredApplications = filterApplications(applications, searchQuery, statusFilter);
    return sortApplications(filteredApplications, sortKey);
  }, [applications, searchQuery, sortKey, statusFilter]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
              <Input
                helperText="회사명 또는 직무명으로 검색합니다."
                label="검색"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="회사명, 직무명"
                type="search"
                value={searchQuery}
              />
              <div className="grid gap-1.5">
                <p className="text-body-medium text-neutral-900">정렬</p>
                <div className="flex flex-wrap gap-2">
                  {APPLICATION_SORT_OPTIONS.map((option) => (
                    <Button
                      aria-pressed={sortKey === option.value}
                      key={option.value}
                      onClick={() => setSortKey(option.value)}
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
                    onClick={() => setStatusFilter(filter)}
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
            </p>
          </div>
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
