"use client";

import { Button } from "@/components/ui/button";
import {
  COMMON_QUESTION_TYPES,
  COMMON_QUESTION_TYPE_LABEL,
  ESSAY_ANSWER_STATUSES,
  ESSAY_FILTER_GROUP_LABEL,
} from "@/features/essays/constants";
import type { EssayFacets } from "@/features/essays/library-utils";
import type { EssayFilterGroupKey, EssayLibraryFilters } from "@/features/essays/types";

function FilterChipGroup<TValue extends string | number>({
  className,
  getLabel,
  label,
  onToggle,
  options,
  selected,
}: {
  className?: string;
  label: string;
  options: TValue[];
  selected: TValue[];
  getLabel?: (value: TValue) => string;
  onToggle: (value: TValue) => void;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <fieldset className={className}>
      <legend className="mb-2 text-body-medium text-neutral-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <Button
              aria-pressed={active}
              key={String(option)}
              onClick={() => onToggle(option)}
              size="sm"
              variant={active ? "primary" : "secondary"}
            >
              {getLabel ? getLabel(option) : String(option)}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface EssayFilterPanelProps {
  facets: EssayFacets;
  filters: EssayLibraryFilters;
  onToggle: <TKey extends EssayFilterGroupKey>(
    group: TKey,
    value: EssayLibraryFilters[TKey][number],
  ) => void;
}

export function EssayFilterPanel({ facets, filters, onToggle }: EssayFilterPanelProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,720px)_minmax(220px,320px)] xl:items-start">
      <div className="grid gap-3">
        <FilterChipGroup
          className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3"
          label={ESSAY_FILTER_GROUP_LABEL.companies}
          onToggle={(value) => onToggle("companies", value)}
          options={facets.companies}
          selected={filters.companies}
        />
        <FilterChipGroup
          className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3"
          label={ESSAY_FILTER_GROUP_LABEL.positions}
          onToggle={(value) => onToggle("positions", value)}
          options={facets.positions}
          selected={filters.positions}
        />
        <FilterChipGroup
          className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3"
          getLabel={(value) => COMMON_QUESTION_TYPE_LABEL[value]}
          label={ESSAY_FILTER_GROUP_LABEL.questionTypes}
          onToggle={(value) => onToggle("questionTypes", value)}
          options={COMMON_QUESTION_TYPES}
          selected={filters.questionTypes}
        />
        <FilterChipGroup
          className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3"
          label={ESSAY_FILTER_GROUP_LABEL.experienceTags}
          onToggle={(value) => onToggle("experienceTags", value)}
          options={facets.experienceTags}
          selected={filters.experienceTags}
        />
        <FilterChipGroup
          className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3"
          getLabel={(value) => `${value}년`}
          label={ESSAY_FILTER_GROUP_LABEL.years}
          onToggle={(value) => onToggle("years", value)}
          options={facets.years}
          selected={filters.years}
        />
      </div>
      <FilterChipGroup
        className="rounded-control border border-neutral-200/70 bg-neutral-50/40 p-3 xl:sticky xl:top-20"
        label={ESSAY_FILTER_GROUP_LABEL.statuses}
        onToggle={(value) => onToggle("statuses", value)}
        options={ESSAY_ANSWER_STATUSES}
        selected={filters.statuses}
      />
    </div>
  );
}
