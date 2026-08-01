"use client";

import { Button } from "@/components/ui/button";
import {
  COMMON_QUESTION_TYPE_LABEL,
  ESSAY_FILTER_GROUP_LABEL,
} from "@/features/essays/constants";
import type { EssayFilterGroupKey, EssayLibraryFilters } from "@/features/essays/types";

interface ActiveFilter {
  group: EssayFilterGroupKey;
  value: string | number;
  label: string;
}

function collectActiveFilters(filters: EssayLibraryFilters): ActiveFilter[] {
  return [
    ...filters.companies.map((value) => ({ group: "companies" as const, value, label: value })),
    ...filters.positions.map((value) => ({ group: "positions" as const, value, label: value })),
    ...filters.questionTypes.map((value) => ({
      group: "questionTypes" as const,
      value,
      label: COMMON_QUESTION_TYPE_LABEL[value],
    })),
    ...filters.experienceTags.map((value) => ({
      group: "experienceTags" as const,
      value,
      label: value,
    })),
    ...filters.statuses.map((value) => ({ group: "statuses" as const, value, label: value })),
    ...filters.years.map((value) => ({ group: "years" as const, value, label: `${value}년` })),
  ];
}

interface ActiveFilterListProps {
  filters: EssayLibraryFilters;
  onRemove: <TKey extends EssayFilterGroupKey>(
    group: TKey,
    value: EssayLibraryFilters[TKey][number],
  ) => void;
  onReset: () => void;
}

export function ActiveFilterList({ filters, onRemove, onReset }: ActiveFilterListProps) {
  const activeFilters = collectActiveFilters(filters);
  const trimmedQuery = filters.query.trim();

  if (activeFilters.length === 0 && !trimmedQuery) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-neutral-600">적용된 조건</span>

      {trimmedQuery ? (
        <span className="inline-flex min-h-6 items-center rounded-badge border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-caption text-neutral-600">
          검색어: {trimmedQuery}
        </span>
      ) : null}

      {activeFilters.map((filter) => (
        <Button
          aria-label={`${ESSAY_FILTER_GROUP_LABEL[filter.group]} ${filter.label} 필터 해제`}
          key={`${filter.group}-${filter.value}`}
          onClick={() =>
            onRemove(
              filter.group,
              filter.value as EssayLibraryFilters[typeof filter.group][number],
            )
          }
          size="sm"
          trailingIcon={<span aria-hidden="true">×</span>}
          variant="secondary"
        >
          {ESSAY_FILTER_GROUP_LABEL[filter.group]}: {filter.label}
        </Button>
      ))}

      <Button onClick={onReset} size="sm" variant="ghost">
        전체 초기화
      </Button>
    </div>
  );
}
