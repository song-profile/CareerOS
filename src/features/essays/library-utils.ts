import { DEFAULT_ESSAY_SORT } from "@/features/essays/constants";
import type {
  EssayFilterGroupKey,
  EssayLibraryFilters,
  EssayLibraryItem,
  EssaySortOption,
} from "@/features/essays/types";

export const EMPTY_ESSAY_FILTERS: EssayLibraryFilters = {
  query: "",
  companies: [],
  positions: [],
  questionTypes: [],
  experienceTags: [],
  statuses: [],
  years: [],
  sort: DEFAULT_ESSAY_SORT,
};

export interface EssayFacets {
  companies: string[];
  positions: string[];
  years: number[];
  experienceTags: string[];
}

/** 필터 후보값은 목록 데이터에서 파생한다. API 연동 후에도 동일하게 동작한다. */
export function getEssayFacets(items: EssayLibraryItem[]): EssayFacets {
  const companies = new Set<string>();
  const positions = new Set<string>();
  const years = new Set<number>();
  const experienceTags = new Set<string>();

  for (const item of items) {
    companies.add(item.companyName);
    positions.add(item.positionName);
    years.add(item.recruitmentYear);
    for (const tag of item.experienceTags) {
      experienceTags.add(tag);
    }
  }

  return {
    companies: [...companies].sort((first, second) => first.localeCompare(second, "ko-KR")),
    positions: [...positions].sort((first, second) => first.localeCompare(second, "ko-KR")),
    years: [...years].sort((first, second) => second - first),
    experienceTags: [...experienceTags].sort((first, second) => first.localeCompare(second, "ko-KR")),
  };
}

function matchesQuery(item: EssayLibraryItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    item.companyName,
    item.positionName,
    item.questionText,
    item.contentPreview,
    ...item.experienceTags,
    ...item.competencyTags,
  ];

  return haystack.some((field) => field.toLowerCase().includes(normalizedQuery));
}

/** 그룹이 비어 있으면 제약 없음으로 본다. 그룹 간에는 AND, 그룹 안에서는 OR. */
function matchesGroup<TValue>(selected: TValue[], values: TValue[]): boolean {
  return selected.length === 0 || values.some((value) => selected.includes(value));
}

export function filterEssays(
  items: EssayLibraryItem[],
  filters: EssayLibraryFilters,
): EssayLibraryItem[] {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return items.filter(
    (item) =>
      matchesQuery(item, normalizedQuery) &&
      matchesGroup(filters.companies, [item.companyName]) &&
      matchesGroup(filters.positions, [item.positionName]) &&
      matchesGroup(filters.questionTypes, [item.commonQuestionType]) &&
      matchesGroup(filters.statuses, [item.answerStatus]) &&
      matchesGroup(filters.years, [item.recruitmentYear]) &&
      matchesGroup(filters.experienceTags, item.experienceTags),
  );
}

export function sortEssays(
  items: EssayLibraryItem[],
  sort: EssaySortOption,
): EssayLibraryItem[] {
  return [...items].sort((first, second) => {
    switch (sort) {
      case "updatedAsc":
        return first.updatedAt.getTime() - second.updatedAt.getTime();
      case "companyAsc":
        return first.companyName.localeCompare(second.companyName, "ko-KR");
      case "characterCountDesc":
        return second.characterCount - first.characterCount;
      case "submittedDesc":
        // 미제출 답변은 항상 뒤로 보낸다.
        return (second.submittedAt?.getTime() ?? -Infinity) - (first.submittedAt?.getTime() ?? -Infinity);
      default:
        return second.updatedAt.getTime() - first.updatedAt.getTime();
    }
  });
}

export function countActiveFilters(filters: EssayLibraryFilters): number {
  return (
    filters.companies.length +
    filters.positions.length +
    filters.questionTypes.length +
    filters.experienceTags.length +
    filters.statuses.length +
    filters.years.length +
    (filters.query.trim() ? 1 : 0)
  );
}

/** 그룹 키만 알면 어떤 필터든 같은 방식으로 켜고 끌 수 있다. */
export function toggleFilterValue<TKey extends EssayFilterGroupKey>(
  filters: EssayLibraryFilters,
  group: TKey,
  value: EssayLibraryFilters[TKey][number],
): EssayLibraryFilters {
  const current = filters[group] as EssayLibraryFilters[TKey][number][];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return { ...filters, [group]: next } as EssayLibraryFilters;
}
