"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ESSAY_ANSWER_STATUS_VARIANT } from "@/features/essays/constants";
import { getDefaultComparePair, sortVersionsLatestFirst } from "@/features/essays/version-utils";
import type { EssayAnswerVersion } from "@/features/essays/version-types";
import { cn } from "@/lib/utils/cn";

function formatVersionDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

interface EssayVersionPanelProps {
  answerGroupId: string;
  versions: EssayAnswerVersion[];
  selectedVersionId: string;
  onSelect: (versionId: string) => void;
  onCreateClick: () => void;
}

export function EssayVersionPanel({
  answerGroupId,
  onCreateClick,
  onSelect,
  selectedVersionId,
  versions,
}: EssayVersionPanelProps) {
  const sorted = sortVersionsLatestFirst(versions);
  const comparePair = getDefaultComparePair(versions);
  const compareHref = comparePair
    ? `/essays/${answerGroupId}/compare?left=${encodeURIComponent(comparePair.left.versionId)}&right=${encodeURIComponent(comparePair.right.versionId)}`
    : null;

  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h3 text-neutral-900">버전 이력</h2>
            <span className="text-caption text-neutral-600">{versions.length}개</span>
          </div>

          <ul className="grid gap-2">
            {sorted.map((version) => {
              const selected = version.versionId === selectedVersionId;
              // 부모가 항상 직전 번호는 아니므로 실제 버전을 찾아서 표시한다.
              const parentNumber = versions.find(
                (candidate) => candidate.versionId === version.parentVersionId,
              )?.versionNumber;

              return (
                <li key={version.versionId}>
                  <button
                    aria-current={selected ? "true" : undefined}
                    className={cn(
                      "w-full rounded-card border p-3 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      selected
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 bg-neutral-0 hover:bg-neutral-50",
                    )}
                    onClick={() => onSelect(version.versionId)}
                    type="button"
                  >
                    <div className="grid gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-mono text-neutral-900">
                          v{version.versionNumber}
                        </span>
                        <Badge variant={ESSAY_ANSWER_STATUS_VARIANT[version.answerStatus]}>
                          {version.answerStatus}
                        </Badge>
                        {version.isLocked ? <Badge>잠금 · 수정 불가</Badge> : null}
                        {selected ? <Badge variant="primary">보는 중</Badge> : null}
                      </div>

                      <p className="text-caption text-neutral-600">
                        {version.submittedAt
                          ? `${formatVersionDate(version.submittedAt)} 제출`
                          : formatVersionDate(version.createdAt)}
                        {" · "}
                        {version.characterCount.toLocaleString("ko-KR")}자
                      </p>

                      <p className="text-caption text-neutral-400">
                        {version.createdReason}
                        {parentNumber ? ` · v${parentNumber}에서 생성` : null}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
            <Button onClick={onCreateClick} size="sm" variant="secondary">
              새 버전 만들기
            </Button>

            {compareHref ? (
              <LinkButton href={compareHref} size="sm" variant="ghost">
                버전 비교
              </LinkButton>
            ) : (
              <p className="text-caption text-neutral-400">
                버전이 하나뿐이라 비교할 다른 버전이 없습니다.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
