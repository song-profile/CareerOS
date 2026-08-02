"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ESSAY_ANSWER_STATUS_VARIANT } from "@/features/essays/constants";
import type {
  CreatableVersionStatus,
  EssayAnswerVersion,
} from "@/features/essays/version-types";

const MAX_REASON_LENGTH = 100;

interface CreateVersionDialogProps {
  open: boolean;
  saving: boolean;
  baseVersion: EssayAnswerVersion;
  onCancel: () => void;
  onConfirm: (input: { createdReason: string; copyContent: boolean }) => void;
}

export function CreateVersionDialog({
  baseVersion,
  onCancel,
  onConfirm,
  open,
  saving,
}: CreateVersionDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const reasonRef = useRef<HTMLInputElement>(null);
  const [createdReason, setCreatedReason] = useState("");
  const [copyContent, setCopyContent] = useState(true);

  // 제출본에서 만들면 개선본, 작성본에서 만들면 새 작성본으로 고정된다.
  const nextStatus: CreatableVersionStatus = baseVersion.isLocked ? "개선본" : "작성본";

  useEffect(() => {
    if (!open) {
      return;
    }

    setCreatedReason("");
    setCopyContent(true);
    reasonRef.current?.focus();

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

  const reasonTooLong = createdReason.length > MAX_REASON_LENGTH;

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
            새 {nextStatus} 만들기
          </h2>
          <div className="grid gap-2 text-body text-neutral-600" id={descriptionId}>
            <p>
              기준 버전은 그대로 보존되고 새 버전이 추가됩니다. 제출본을 직접 수정하지 않습니다.
            </p>
            <div className="grid gap-1 rounded-card border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>기준 버전</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-mono text-neutral-900">
                    v{baseVersion.versionNumber}
                  </span>
                  <Badge variant={ESSAY_ANSWER_STATUS_VARIANT[baseVersion.answerStatus]}>
                    {baseVersion.answerStatus}
                  </Badge>
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>만들 상태</span>
                <span className="text-neutral-900">{nextStatus}</span>
              </div>
            </div>
          </div>
        </div>

        <Input
          ref={reasonRef}
          errorMessage={reasonTooLong ? `${MAX_REASON_LENGTH}자 이내로 입력해 주세요.` : undefined}
          helperText={`선택 입력입니다. 비워두면 "이유 없음"으로 저장됩니다. (${createdReason.length}/${MAX_REASON_LENGTH})`}
          label="생성 이유"
          onChange={(event) => setCreatedReason(event.target.value)}
          placeholder="예: 문항 글자 수에 맞춰 축약"
          value={createdReason}
        />

        <label className="flex items-start gap-2 text-body text-neutral-900">
          <input
            checked={copyContent}
            className="mt-0.5 h-4 w-4 rounded border-neutral-200 text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            onChange={(event) => setCopyContent(event.target.checked)}
            type="checkbox"
          />
          <span>
            기준 버전의 본문을 복사해서 시작
            <span className="block text-caption text-neutral-600">
              해제하면 빈 본문으로 시작합니다. 태그 연결은 어느 쪽이든 복사됩니다.
            </span>
          </span>
        </label>

        <p className="text-caption text-neutral-400">
          새 버전 번호와 상태는 서버가 결정합니다.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onCancel} variant="secondary">
            취소
          </Button>
          <Button
            disabled={reasonTooLong}
            loading={saving}
            onClick={() => onConfirm({ copyContent, createdReason })}
          >
            {nextStatus} 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
