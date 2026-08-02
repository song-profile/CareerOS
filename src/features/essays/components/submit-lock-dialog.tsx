"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

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
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    confirmRef.current?.focus();
  }, [open]);

  return (
    <Dialog
      description={
        <div className="grid gap-2">
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
          <p className="text-caption text-neutral-400">저장하면 서버에 제출본으로 기록됩니다.</p>
        </div>
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onCancel} variant="secondary">
            취소
          </Button>
          <Button ref={confirmRef} loading={saving} onClick={onConfirm}>
            제출본으로 저장
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      title="제출본으로 저장할까요?"
    />
  );
}
