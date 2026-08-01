"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { ESSAY_ANSWER_STATUS_VARIANT } from "@/features/essays/constants";
import { compareParagraphs, sortVersionsLatestFirst } from "@/features/essays/version-utils";
import type { ComparedParagraph } from "@/features/essays/version-utils";
import type { EssayAnswerVersion } from "@/features/essays/version-types";
import { cn } from "@/lib/utils/cn";

function formatVersionDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

const changeClassName: Record<ComparedParagraph["change"], string> = {
  same: "border-transparent",
  added: "border-success-600 bg-success-50",
  removed: "border-danger-600 bg-danger-50",
};

const changeLabel: Record<ComparedParagraph["change"], string> = {
  same: "",
  added: "이 버전에만 있음",
  removed: "이 버전에만 있음",
};

interface VersionColumnProps {
  version: EssayAnswerVersion;
  paragraphs: ComparedParagraph[];
  headingId: string;
  side: string;
}

function VersionColumn({ headingId, paragraphs, side, version }: VersionColumnProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <p className="text-caption text-neutral-400">{side}</p>
            <h2 className="flex flex-wrap items-center gap-1.5 text-h3 text-neutral-900" id={headingId}>
              <span className="font-mono text-mono">v{version.versionNumber}</span>
              <Badge variant={ESSAY_ANSWER_STATUS_VARIANT[version.answerStatus]}>
                {version.answerStatus}
              </Badge>
              {version.isLocked ? <Badge>잠금</Badge> : null}
            </h2>
            <p className="text-caption text-neutral-600">
              {version.submittedAt
                ? `${formatVersionDate(version.submittedAt)} 제출`
                : formatVersionDate(version.createdAt)}
              {" · "}
              {version.characterCount.toLocaleString("ko-KR")}자
            </p>
            <p className="text-caption text-neutral-400">{version.createdReason}</p>
          </div>

          <div className="grid gap-2 border-t border-neutral-200 pt-3">
            {paragraphs.map((paragraph, index) => (
              <div
                className={cn("rounded-card border-l-4 py-1 pl-3", changeClassName[paragraph.change])}
                key={`${index}-${paragraph.text.slice(0, 12)}`}
              >
                {paragraph.change === "same" ? null : (
                  <p className="text-caption text-neutral-600">{changeLabel[paragraph.change]}</p>
                )}
                <p className="whitespace-pre-wrap text-body leading-7 text-neutral-900">
                  {paragraph.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-neutral-200 pt-3">
            {version.experienceTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {version.competencyTags.map((tag) => (
              <Badge className="border-dashed" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EssayVersionCompareProps {
  answerGroupId: string;
  versions: EssayAnswerVersion[];
  left: EssayAnswerVersion;
  right: EssayAnswerVersion;
}

export function EssayVersionCompare({
  answerGroupId,
  left,
  right,
  versions,
}: EssayVersionCompareProps) {
  const router = useRouter();
  const compared = compareParagraphs(left.content, right.content);
  const sorted = sortVersionsLatestFirst(versions);
  const options = sorted.map((version) => ({
    label: `v${version.versionNumber} · ${version.answerStatus}`,
    value: version.versionId,
  }));

  function navigate(nextLeft: string, nextRight: string) {
    router.push(
      `/essays/${answerGroupId}/compare?left=${encodeURIComponent(nextLeft)}&right=${encodeURIComponent(nextRight)}`,
    );
  }

  const characterDelta = right.characterCount - left.characterCount;

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="왼쪽 버전"
                onChange={(event) => navigate(event.target.value, right.versionId)}
                options={options}
                value={left.versionId}
              />
              <Select
                label="오른쪽 버전"
                onChange={(event) => navigate(left.versionId, event.target.value)}
                options={options}
                value={right.versionId}
              />
            </div>

            {left.versionId === right.versionId ? (
              <p className="text-body text-danger-600" role="alert">
                같은 버전을 양쪽에 선택했습니다. 서로 다른 버전을 골라 주세요.
              </p>
            ) : (
              <p className="text-caption text-neutral-600">
                글자 수 차이{" "}
                <span className="font-mono text-mono text-neutral-900">
                  {characterDelta > 0 ? "+" : ""}
                  {characterDelta.toLocaleString("ko-KR")}자
                </span>
              </p>
            )}

            <p className="text-caption text-neutral-400">
              문단 단위로 나란히 비교합니다. 문단 안에서 한 글자만 바뀌어도 문단 전체가 변경으로
              표시되고, 문단 순서만 바뀐 경우에도 양쪽 모두 변경으로 표시됩니다. 문자 단위 비교는
              제공하지 않습니다.
            </p>

            <LinkButton
              className="w-full sm:w-fit"
              href={`/essays/${answerGroupId}`}
              size="sm"
              variant="secondary"
            >
              에디터로 돌아가기
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <VersionColumn
          headingId="compare-left"
          paragraphs={compared.left}
          side="이전 버전"
          version={left}
        />
        <VersionColumn
          headingId="compare-right"
          paragraphs={compared.right}
          side="비교 대상"
          version={right}
        />
      </div>
    </div>
  );
}
