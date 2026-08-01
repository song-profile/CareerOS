"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { CredentialValidityBadge } from "@/features/materials/components/credential-validity-badge";
import { MaterialsEmptyState } from "@/features/materials/components/materials-states";
import {
  filterCredentials,
  formatCredentialDate,
  maskCredentialNumber,
  sortCredentials,
} from "@/features/materials/credential-utils";
import type {
  Credential,
  CredentialSortKey,
  CredentialType,
  CredentialValidityFilter,
} from "@/features/materials/types";

const TYPE_FILTERS: (CredentialType | "전체")[] = ["전체", "자격증", "어학"];
const VALIDITY_FILTERS: CredentialValidityFilter[] = ["전체", "유효", "만료", "영구"];

const SORT_OPTIONS: { label: string; value: CredentialSortKey }[] = [
  { label: "만료 임박순", value: "expiresSoon" },
  { label: "최신 취득순", value: "acquiredDesc" },
  { label: "이름순", value: "nameAsc" },
];

interface CredentialListProps {
  credentials: Credential[];
}

export function CredentialList({ credentials }: CredentialListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CredentialType | "전체">("전체");
  const [validityFilter, setValidityFilter] = useState<CredentialValidityFilter>("전체");
  const [sortKey, setSortKey] = useState<CredentialSortKey>("expiresSoon");

  const visible = useMemo(
    () =>
      sortCredentials(
        filterCredentials(credentials, searchQuery, typeFilter, validityFilter),
        sortKey,
      ),
    [credentials, searchQuery, sortKey, typeFilter, validityFilter],
  );

  function resetFilters() {
    setSearchQuery("");
    setTypeFilter("전체");
    setValidityFilter("전체");
  }

  const hasNoData = credentials.length === 0;

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_200px] lg:items-end">
              <Input
                helperText="자격명, 발급기관, 점수·등급에서 찾습니다."
                label="자격 검색"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="예: SQLD, TOEIC"
                type="search"
                value={searchQuery}
              />
              <Select
                label="정렬"
                onChange={(event) => setSortKey(event.target.value as CredentialSortKey)}
                options={SORT_OPTIONS}
                value={sortKey}
              />
            </div>

            <fieldset className="grid gap-2">
              <legend className="mb-2 text-body-medium text-neutral-900">자격 구분</legend>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((filter) => (
                  <Button
                    aria-pressed={typeFilter === filter}
                    key={filter}
                    onClick={() => setTypeFilter(filter)}
                    size="sm"
                    variant={typeFilter === filter ? "primary" : "secondary"}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-2">
              <legend className="mb-2 text-body-medium text-neutral-900">유효 상태</legend>
              <div className="flex flex-wrap gap-2">
                {VALIDITY_FILTERS.map((filter) => (
                  <Button
                    aria-pressed={validityFilter === filter}
                    key={filter}
                    onClick={() => setValidityFilter(filter)}
                    size="sm"
                    variant={validityFilter === filter ? "primary" : "secondary"}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </fieldset>

            <p aria-live="polite" className="text-caption text-neutral-600">
              전체 {credentials.length}개 중 {visible.length}개를 표시합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {hasNoData ? (
        <MaterialsEmptyState
          actionHref="/materials/credentials/new"
          actionLabel="자격 등록"
          description="자격증과 어학 성적을 등록하면 지원서를 쓸 때 번호와 취득일을 바로 복사할 수 있습니다."
          title="등록된 자격이 없습니다."
        />
      ) : null}

      {!hasNoData && visible.length === 0 ? (
        <MaterialsEmptyState
          actionLabel="필터 초기화"
          description="검색어를 줄이거나 필터를 전체로 바꾸면 다시 확인할 수 있습니다."
          onAction={resetFilters}
          title="선택한 조건에 맞는 자격이 없습니다."
        />
      ) : null}

      {visible.length > 0 ? (
        <ul className="grid gap-3">
          {visible.map((credential) => (
            <li key={credential.id}>
              <Card>
                <CardContent>
                  <div className="grid gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 grid gap-1">
                        <p className="break-words text-body-medium text-neutral-900">
                          {credential.name}
                        </p>
                        <p className="break-words text-caption text-neutral-600">
                          {credential.issuer || "발급기관 미입력"}
                        </p>
                      </div>
                      <Badge>{credential.credentialType}</Badge>
                    </div>

                    <div className="grid gap-1.5 text-caption text-neutral-600">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>취득 {formatCredentialDate(credential.acquiredAt)}</span>
                        {credential.score ? <span>점수 {credential.score}</span> : null}
                        {credential.grade ? <span>등급 {credential.grade}</span> : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span>자격번호</span>
                        <span className="break-all font-mono text-mono text-neutral-900">
                          {credential.credentialNumber
                            ? maskCredentialNumber(credential.credentialNumber)
                            : "미입력"}
                        </span>
                      </div>
                      <CredentialValidityBadge credential={credential} />
                    </div>

                    <LinkButton
                      className="w-full sm:w-fit"
                      href={`/materials/credentials/${credential.id}`}
                      size="sm"
                      variant="secondary"
                    >
                      상세 보기
                    </LinkButton>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
