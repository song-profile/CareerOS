import type {
  ApplicationListItem,
  ApplicationSortKey,
  ApplicationStatus,
  ApplicationStatusFilter,
} from "@/features/applications/types";

export const APPLICATION_STATUS_FILTERS: ApplicationStatusFilter[] = [
  "전체",
  "작성중",
  "지원완료",
  "면접",
  "합격",
];

export const APPLICATION_SORT_OPTIONS: { label: string; value: ApplicationSortKey }[] = [
  { label: "마감순", value: "deadline" },
  { label: "회사명순", value: "companyName" },
];

export function matchesStatusFilter(status: ApplicationStatus, filter: ApplicationStatusFilter): boolean {
  if (filter === "전체") {
    return true;
  }

  if (filter === "합격") {
    return status === "최종합격";
  }

  return status === filter;
}

export function filterApplications(
  applications: ApplicationListItem[],
  searchQuery: string,
  statusFilter: ApplicationStatusFilter,
): ApplicationListItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return applications.filter((application) => {
    const matchesSearch =
      !normalizedQuery ||
      application.companyName.toLowerCase().includes(normalizedQuery) ||
      application.position.toLowerCase().includes(normalizedQuery);

    return matchesSearch && matchesStatusFilter(application.status, statusFilter);
  });
}

export function sortApplications(
  applications: ApplicationListItem[],
  sortKey: ApplicationSortKey,
): ApplicationListItem[] {
  return [...applications].sort((first, second) => {
    if (sortKey === "companyName") {
      return first.companyName.localeCompare(second.companyName, "ko-KR");
    }

    return first.deadline.getTime() - second.deadline.getTime();
  });
}
