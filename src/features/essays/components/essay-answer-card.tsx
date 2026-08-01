"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COMMON_QUESTION_TYPE_LABEL } from "@/features/essays/constants";
import { EssayStatusBadge } from "@/features/essays/components/essay-status-badge";
import type { EssayLibraryItem } from "@/features/essays/types";

function formatEssayDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

interface EssayAnswerCardProps {
  item: EssayLibraryItem;
}

export function EssayAnswerCard({ item }: EssayAnswerCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.contentPreview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const dateLabel = item.submittedAt
    ? `제출일 ${formatEssayDate(item.submittedAt)}`
    : `최종 수정 ${formatEssayDate(item.updatedAt)}`;

  return (
    <Card className="relative transition-colors focus-within:border-primary-500 hover:bg-neutral-50">
      <CardContent>
        <article className="grid gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {/* 카드 전체를 링크 영역으로 넓히되 내부 버튼은 위에 남긴다. */}
              <Link
                className="rounded-control text-body-medium text-neutral-900 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                href={`/essays/${item.answerId}`}
              >
                {item.companyName} · {item.positionName}
              </Link>
              <p className="mt-1 text-caption text-neutral-400">
                {item.recruitmentYear} {item.season}
              </p>
            </div>
            <EssayStatusBadge status={item.answerStatus} version={item.version} />
          </div>

          <p className="text-body text-neutral-900">{item.questionText}</p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="primary">
              {COMMON_QUESTION_TYPE_LABEL[item.commonQuestionType]}
            </Badge>
            {item.experienceTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {item.competencyTags.map((tag) => (
              <Badge className="border-dashed" key={tag}>
                {tag}
              </Badge>
            ))}
          </div>

          <p className="line-clamp-3 text-body text-neutral-600">{item.contentPreview}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-3">
            <div className="flex flex-wrap items-center gap-3 text-caption text-neutral-600">
              <span className="font-mono text-mono">
                {item.characterCount.toLocaleString("ko-KR")} / {item.characterLimit.toLocaleString("ko-KR")}자
              </span>
              <span>{dateLabel}</span>
            </div>
            <Button
              aria-label={`${item.companyName} ${COMMON_QUESTION_TYPE_LABEL[item.commonQuestionType]} 답변 미리보기 복사`}
              className="relative z-10"
              onClick={handleCopy}
              size="sm"
              variant="secondary"
            >
              {copied ? "복사됨" : "미리보기 복사"}
            </Button>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
