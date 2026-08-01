"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/components/ui/copy-field";
import { cn } from "@/lib/utils/cn";

type CopyState = "idle" | "copied" | "failed";

interface MaskedFieldProps {
  label: string;
  /** 원본 값. 표시 여부와 무관하게 복사 대상이 된다. */
  value: string;
  /** 가려진 상태에서 보여줄 문자열. */
  maskedValue: string;
  emptyText?: string;
  className?: string;
}

/**
 * 기본은 가려져 있고 사용자가 누를 때만 전체 값을 보여주는 필드.
 *
 * 표시 상태는 이 컴포넌트 안에서만 관리해 다른 항목에 영향을 주지 않고,
 * 페이지를 벗어나거나 새로고침하면 다시 가려진 상태로 시작한다.
 * 브라우저 저장소에는 아무것도 남기지 않는다.
 * 화면 보호일 뿐이므로 서버의 권한 검사를 대체하지 않는다.
 */
export function MaskedField({
  className,
  emptyText = "미입력",
  label,
  maskedValue,
  value,
}: MaskedFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const isEmpty = value.trim().length === 0;

  async function handleCopy() {
    const succeeded = await copyToClipboard(value);

    setCopyState(succeeded ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <span className="shrink-0 text-caption text-neutral-600">{label}</span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 sm:justify-end">
        <span
          className={cn(
            "min-w-0 break-all font-mono text-mono",
            isEmpty ? "text-neutral-400" : "text-neutral-900",
          )}
        >
          {isEmpty ? emptyText : revealed ? value : maskedValue}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <span
            aria-live="polite"
            className={cn(
              "text-caption",
              copyState === "failed" ? "text-danger-600" : "text-success-700",
            )}
            role="status"
          >
            {copyState === "copied" ? "복사됨" : null}
            {copyState === "failed" ? "복사 실패" : null}
          </span>
          <Button
            aria-label={revealed ? `${label} 가리기` : `${label} 전체 보기`}
            disabled={isEmpty}
            onClick={() => setRevealed((current) => !current)}
            size="sm"
            variant="ghost"
          >
            {revealed ? "가리기" : "보기"}
          </Button>
          <Button
            aria-label={`${label} 복사`}
            disabled={isEmpty}
            onClick={() => void handleCopy()}
            size="sm"
            variant="secondary"
          >
            복사
          </Button>
        </div>
      </div>
    </div>
  );
}
