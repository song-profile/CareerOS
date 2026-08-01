import {
  COMMON_QUESTION_TYPES,
  DEFAULT_ESSAY_SORT,
  ESSAY_ANSWER_STATUSES,
  ESSAY_SORT_OPTIONS,
} from "@/features/essays/constants";
import type {
  CommonQuestionType,
  EssayAnswerStatus,
  EssayLibraryFilters,
  EssaySortOption,
} from "@/features/essays/types";

/** URL 파라미터 이름. 링크 공유 시 사람이 읽을 수 있도록 짧게 유지한다. */
const PARAM = {
  query: "q",
  companies: "company",
  positions: "position",
  questionTypes: "type",
  experienceTags: "tag",
  statuses: "status",
  years: "year",
  sort: "sort",
} as const;

type ReadonlySearchParams = Pick<URLSearchParams, "get" | "getAll">;

function keepKnown<TValue extends string>(values: string[], allowed: TValue[]): TValue[] {
  return values.filter((value): value is TValue => allowed.some((item) => item === value));
}

export function parseEssayFilters(searchParams: ReadonlySearchParams): EssayLibraryFilters {
  const sort = ESSAY_SORT_OPTIONS.map((option) => option.value).find(
    (value) => value === searchParams.get(PARAM.sort),
  );

  const years = searchParams
    .getAll(PARAM.years)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  return {
    query: searchParams.get(PARAM.query) ?? "",
    companies: searchParams.getAll(PARAM.companies),
    positions: searchParams.getAll(PARAM.positions),
    questionTypes: keepKnown<CommonQuestionType>(
      searchParams.getAll(PARAM.questionTypes),
      COMMON_QUESTION_TYPES,
    ),
    experienceTags: searchParams.getAll(PARAM.experienceTags),
    statuses: keepKnown<EssayAnswerStatus>(
      searchParams.getAll(PARAM.statuses),
      ESSAY_ANSWER_STATUSES,
    ),
    years,
    sort: (sort ?? DEFAULT_ESSAY_SORT) as EssaySortOption,
  };
}

/** 기본값은 URL에 쓰지 않아 공유 링크가 짧게 유지된다. */
export function buildEssaySearchParams(filters: EssayLibraryFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery) {
    searchParams.set(PARAM.query, trimmedQuery);
  }

  for (const company of filters.companies) {
    searchParams.append(PARAM.companies, company);
  }
  for (const position of filters.positions) {
    searchParams.append(PARAM.positions, position);
  }
  for (const questionType of filters.questionTypes) {
    searchParams.append(PARAM.questionTypes, questionType);
  }
  for (const tag of filters.experienceTags) {
    searchParams.append(PARAM.experienceTags, tag);
  }
  for (const status of filters.statuses) {
    searchParams.append(PARAM.statuses, status);
  }
  for (const year of filters.years) {
    searchParams.append(PARAM.years, String(year));
  }

  if (filters.sort !== DEFAULT_ESSAY_SORT) {
    searchParams.set(PARAM.sort, filters.sort);
  }

  return searchParams;
}
