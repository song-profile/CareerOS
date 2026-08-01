"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type CopyState = "idle" | "copied" | "failed";

/**
 * 값을 클립보드에 복사한다.
 * 복사한 값 자체는 어떤 경우에도 로그로 남기지 않는다.
 */
export async function copyToClipboard(value: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

interface CopyFieldProps {
  label: string;
  value: string;
  /** 값이 비었을 때 안내할 문구. */
  emptyText?: string;
  /** 복사 대상 값이 화면 표시값과 다를 때 쓴다. (예: 마스킹된 값을 보여주고 원본을 복사) */
  copyValue?: string;
  mono?: boolean;
  className?: string;
}

/**
 * 라벨 + 값 + 복사 버튼 한 줄.
 * 필드마다 복사 상태를 각자 들고 있어 여러 필드의 피드백이 서로 꼬이지 않는다.
 */
export function CopyField({
  className,
  copyValue,
  emptyText = "미입력",
  label,
  mono = false,
  value,
}: CopyFieldProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const isEmpty = value.trim().length === 0;

  async function handleCopy() {
    const succeeded = await copyToClipboard(copyValue ?? value);

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
            "min-w-0 break-words",
            mono ? "font-mono text-mono" : "text-body",
            isEmpty ? "text-neutral-400" : "text-neutral-900",
          )}
        >
          {isEmpty ? emptyText : value}
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
