import type { ApplicationQueryDto } from "@/features/applications/api/dto";
import {
  toApplicationStatusDto,
  toRecruitmentSeasonDto,
} from "@/features/applications/api/mapper";
import type {
  ApplicationSortKey,
  ApplicationStatusFilter,
  RecruitmentSeason,
} from "@/features/applications/types";

export interface ApplicationListSearchState {
  deleted: boolean;
  keyword: string;
  status: ApplicationStatusFilter;
  sort: ApplicationSortKey;
}

export const DEFAULT_APPLICATION_SEARCH_STATE: ApplicationListSearchState = {
  deleted: false,
  keyword: "",
  status: "전체",
  sort: "deadline",
};

export function parseApplicationListSearchParams(
  params: Record<string, string | string[] | undefined> | undefined,
): ApplicationListSearchState {
  return {
    deleted: getSingleParam(params?.deleted) === "1",
    keyword: getSingleParam(params?.keyword) ?? "",
    status: toStatusFilter(getSingleParam(params?.status)),
    sort: toSortKey(getSingleParam(params?.sort)),
  };
}

export function toApplicationQueryDto(
  state: ApplicationListSearchState,
): ApplicationQueryDto {
  if (state.status === "합격") {
    return {
      keyword: emptyToUndefined(state.keyword),
      status: "FINAL_ACCEPTED",
    };
  }

  return {
    keyword: emptyToUndefined(state.keyword),
    status: state.status === "전체" ? undefined : toApplicationStatusDto(state.status),
  };
}

export function buildApplicationListHref(state: ApplicationListSearchState): string {
  const params = new URLSearchParams();

  if (state.keyword.trim()) {
    params.set("keyword", state.keyword.trim());
  }

  if (state.status !== DEFAULT_APPLICATION_SEARCH_STATE.status) {
    params.set("status", state.status);
  }

  if (state.sort !== DEFAULT_APPLICATION_SEARCH_STATE.sort) {
    params.set("sort", state.sort);
  }

  const query = params.toString();
  return query ? `/applications?${query}` : "/applications";
}

export function toApplicationListSearchState(
  partial: Partial<ApplicationListSearchState>,
  current: ApplicationListSearchState,
): ApplicationListSearchState {
  return { ...current, ...partial };
}

function toStatusFilter(value: string | undefined): ApplicationStatusFilter {
  const filters: ApplicationStatusFilter[] = ["전체", "작성중", "지원완료", "면접", "합격"];
  return filters.find((filter) => filter === value) ?? DEFAULT_APPLICATION_SEARCH_STATE.status;
}

function toSortKey(value: string | undefined): ApplicationSortKey {
  return value === "companyName" ? "companyName" : DEFAULT_APPLICATION_SEARCH_STATE.sort;
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toRecruitmentSeasonQueryDto(season: RecruitmentSeason) {
  return toRecruitmentSeasonDto(season);
}
