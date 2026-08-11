"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { ESSAY_ANSWER_STATUS_VARIANT } from "@/features/essays/constants";
import {
  compareParagraphs,
  diffEssayParagraphs,
  sortVersionsLatestFirst,
} from "@/features/essays/version-utils";
import type { ComparedParagraph, ParagraphDiffBlock } from "@/features/essays/version-utils";
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
  changed: "border-amber-600 bg-amber-50",
};

const changeLabel: Record<ComparedParagraph["change"], string> = {
  same: "",
  added: "+ 이 버전에만 있음",
  removed: "− 이 버전에만 있음",
  changed: "± 수정됨",
};

interface VersionMetaProps {
  version: EssayAnswerVersion;
  headingId?: string;
  side: string;
}

function VersionMeta({ headingId, side, version }: VersionMetaProps) {
  return (
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
  );
}

interface VersionColumnProps {
  version: EssayAnswerVersion;
  paragraphs: ComparedParagraph[];
  headingId: string;
  side: string;
}

/** 데스크톱 좌우 비교용 열 하나. 문단별로 자기 쪽 변경만 표시한다. */
function VersionColumn({ headingId, paragraphs, side, version }: VersionColumnProps) {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <VersionMeta headingId={headingId} side={side} version={version} />

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

const inlineBlockClassName: Record<ParagraphDiffBlock["change"], string> = {
  same: "",
  added: "rounded-card border-l-4 border-success-600 bg-success-50 py-1 pl-3",
  removed: "rounded-card border-l-4 border-danger-600 bg-danger-50 py-1 pl-3",
  changed: "rounded-card border-l-4 border-amber-600 bg-amber-50 py-1 pl-3",
};

const inlineBlockLabel: Record<ParagraphDiffBlock["change"], string> = {
  same: "",
  added: "+ 추가됨",
  removed: "− 삭제됨",
  changed: "± 수정됨",
};

/**
 * 모바일 Inline Diff. 두 버전 본문을 한 번만 훑도록 하나의 흐름으로 합쳐 보여준다.
 * changed 문단은 이전 텍스트(취소선)와 새 텍스트를 함께 보여준다.
 */
function InlineDiffList({ blocks }: { blocks: ParagraphDiffBlock[] }) {
  return (
    <ul className="grid gap-2">
      {blocks.map((block, index) => (
        <li
          className={inlineBlockClassName[block.change]}
          key={`${index}-${block.text.slice(0, 12)}`}
        >
          {block.change === "same" ? (
            <p className="whitespace-pre-wrap text-body leading-7 text-neutral-900">{block.text}</p>
          ) : block.change === "changed" ? (
            <div className="grid gap-1">
              <p className="text-caption text-amber-700">{inlineBlockLabel[block.change]}</p>
              <p className="whitespace-pre-wrap text-body leading-7 text-neutral-500 line-through">
                {block.text}
              </p>
              <p className="whitespace-pre-wrap text-body leading-7 text-neutral-900">
                {block.nextText}
              </p>
            </div>
          ) : (
            <div className="grid gap-1">
              <p
                className={cn(
                  "text-caption",
                  block.change === "added" ? "text-success-700" : "text-danger-700",
                )}
              >
                {inlineBlockLabel[block.change]}
              </p>
              <p
                className={cn(
                  "whitespace-pre-wrap text-body leading-7",
                  block.change === "removed" ? "text-neutral-500 line-through" : "text-neutral-900",
                )}
              >
                {block.text}
              </p>
            </div>
          )}
        </li>
      ))}
    </ul>
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
  const inlineBlocks = diffEssayParagraphs(left.content, right.content);
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
              문단 단위로 비교합니다. 추가·삭제·수정된 문단을 색상과 함께 +/− 표시와 글자 라벨로
              구분해 보여주고, 문단 안의 문자 단위 비교는 제공하지 않습니다. 데스크톱은 좌우 비교,
              모바일은 한 화면에서 훑어볼 수 있는 Inline Diff를 보여줍니다.
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

      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
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

      <div className="grid gap-4 lg:hidden">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent>
              <VersionMeta side="이전 버전" version={left} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <VersionMeta side="비교 대상" version={right} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <div className="grid gap-3">
              <h2 className="text-h3 text-neutral-900">본문 비교</h2>
              <InlineDiffList blocks={inlineBlocks} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
