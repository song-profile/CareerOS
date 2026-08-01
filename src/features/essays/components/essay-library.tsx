"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ActiveFilterList } from "@/features/essays/components/active-filter-list";
import { EssayAnswerCard } from "@/features/essays/components/essay-answer-card";
import { EssayFilterPanel } from "@/features/essays/components/essay-filter-panel";
import {
  EssayLibraryNoDataState,
  EssayLibraryNoResultState,
} from "@/features/essays/components/essay-library-states";
import { ESSAY_SORT_OPTIONS } from "@/features/essays/constants";
import {
  EMPTY_ESSAY_FILTERS,
  countActiveFilters,
  filterEssays,
  getEssayFacets,
  sortEssays,
  toggleFilterValue,
} from "@/features/essays/library-utils";
import { buildEssaySearchParams, parseEssayFilters } from "@/features/essays/search-params";
import type {
  EssayFilterGroupKey,
  EssayLibraryFilters,
  EssayLibraryItem,
  EssaySortOption,
} from "@/features/essays/types";
import { cn } from "@/lib/utils/cn";

interface EssayLibraryProps {
  items: EssayLibraryItem[];
}

export function EssayLibrary({ items }: EssayLibraryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => parseEssayFilters(searchParams), [searchParams]);
  const facets = useMemo(() => getEssayFacets(items), [items]);

  // 입력 반응성을 위해 검색어는 로컬 상태를 두고, URL이 바뀌면 다시 맞춘다.
  const [queryInput, setQueryInput] = useState(filters.query);
  useEffect(() => {
    setQueryInput(filters.query);
  }, [filters.query]);

  const visibleItems = useMemo(
    () => sortEssays(filterEssays(items, filters), filters.sort),
    [items, filters],
  );

  function applyFilters(nextFilters: EssayLibraryFilters, useReplace = false) {
    const queryString = buildEssaySearchParams(nextFilters).toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    if (useReplace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  }

  function handleQueryChange(nextQuery: string) {
    setQueryInput(nextQuery);
    // ponytail: 키 입력마다 URL을 교체한다. 목록이 서버 조회로 바뀌면 디바운스를 넣는다.
    applyFilters({ ...filters, query: nextQuery }, true);
  }

  function handleToggle<TKey extends EssayFilterGroupKey>(
    group: TKey,
    value: EssayLibraryFilters[TKey][number],
  ) {
    applyFilters(toggleFilterValue(filters, group, value));
  }

  function handleReset() {
    applyFilters(EMPTY_ESSAY_FILTERS);
  }

  const activeFilterCount = countActiveFilters(filters);
  const hasNoData = items.length === 0;
  const hasNoResult = !hasNoData && visibleItems.length === 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_240px] lg:items-end">
              <Input
                helperText="회사, 직무, 문항, 답변 내용, 태그에서 찾습니다."
                label="자소서 검색"
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="예: 은행, 문제 해결, LOODI"
                type="search"
                value={queryInput}
              />
              <Select
                label="정렬"
                onChange={(event) => applyFilters({ ...filters, sort: event.target.value as EssaySortOption })}
                options={ESSAY_SORT_OPTIONS}
                value={filters.sort}
              />
            </div>

            <Button
              aria-controls="essay-filter-panel"
              aria-expanded={mobileFiltersOpen}
              className="w-full lg:hidden"
              onClick={() => setMobileFiltersOpen((open) => !open)}
              size="sm"
              variant="secondary"
            >
              필터 {activeFilterCount > 0 ? `${activeFilterCount}개 적용됨` : "열기"}
            </Button>

            <div
              className={cn("lg:block", mobileFiltersOpen ? "block" : "hidden")}
              id="essay-filter-panel"
            >
              <EssayFilterPanel facets={facets} filters={filters} onToggle={handleToggle} />
            </div>

            <ActiveFilterList filters={filters} onRemove={handleToggle} onReset={handleReset} />
          </div>
        </CardContent>
      </Card>

      <p aria-live="polite" className="text-body text-neutral-600">
        전체 {items.length}개 중{" "}
        <strong className="text-body-medium text-neutral-900">{visibleItems.length}개</strong>의 답변을
        표시합니다.
      </p>

      {hasNoData ? <EssayLibraryNoDataState /> : null}
      {hasNoResult ? <EssayLibraryNoResultState onReset={handleReset} /> : null}

      {visibleItems.length > 0 ? (
        <div className="grid gap-3">
          {visibleItems.map((item) => (
            <EssayAnswerCard item={item} key={item.answerId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
