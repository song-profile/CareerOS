"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";

interface SubmitLockDialogProps {
  open: boolean;
  saving: boolean;
  companyName: string;
  positionName: string;
  characterCount: number;
  characterLimit: number | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitLockDialog({
  characterCount,
  characterLimit,
  companyName,
  onCancel,
  onConfirm,
  open,
  positionName,
  saving,
}: SubmitLockDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    confirmRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 px-6"
      role="dialog"
    >
      <div className="grid w-full max-w-md gap-4 rounded-modal border border-neutral-200 bg-neutral-0 p-5 shadow-lg">
        <div className="grid gap-2">
          <h2 className="text-h2 text-neutral-900" id={titleId}>
            제출본으로 저장할까요?
          </h2>
          <div className="grid gap-2 text-body text-neutral-600" id={descriptionId}>
            <p>
              제출본은 실제 제출 당시 내용을 보존하기 위해 잠깁니다. 저장한 뒤에는 이 답변을 직접 수정할
              수 없고, 내용을 바꾸려면 개선본이나 새 버전을 만들어야 합니다.
            </p>
            <dl className="grid gap-1 rounded-card border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex justify-between gap-3">
                <dt>회사 · 직무</dt>
                <dd className="text-neutral-900">
                  {companyName} · {positionName}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>현재 글자 수</dt>
                <dd className="font-mono text-mono text-neutral-900">
                  {characterCount.toLocaleString("ko-KR")}
                  {characterLimit === null
                    ? "자 (제한 없음)"
                    : ` / ${characterLimit.toLocaleString("ko-KR")}자`}
                </dd>
              </div>
            </dl>
            <p className="text-caption text-neutral-400">
              현재는 API 연동 전이라 화면 상태만 바뀌며, 새로고침하면 원래 상태로 돌아갑니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onCancel} variant="secondary">
            취소
          </Button>
          <Button ref={confirmRef} loading={saving} onClick={onConfirm}>
            제출본으로 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
