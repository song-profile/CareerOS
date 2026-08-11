"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ESSAY_ANSWER_STATUS_VARIANT } from "@/features/essays/constants";
import type {
  CreatableVersionStatus,
  EssayAnswerVersion,
} from "@/features/essays/version-types";

interface CreateVersionDialogProps {
  open: boolean;
  saving: boolean;
  baseVersion: EssayAnswerVersion;
  onCancel: () => void;
  onConfirm: (input: { copyContent: boolean }) => void;
}

export function CreateVersionDialog({
  baseVersion,
  onCancel,
  onConfirm,
  open,
  saving,
}: CreateVersionDialogProps) {
  const copyContentRef = useRef<HTMLInputElement>(null);
  const [copyContent, setCopyContent] = useState(true);

  // 제출본에서 만들면 개선본, 작성본에서 만들면 새 작성본으로 고정된다.
  const nextStatus: CreatableVersionStatus = baseVersion.isLocked ? "개선본" : "작성본";

  useEffect(() => {
    if (!open) {
      return;
    }

    setCopyContent(true);
    copyContentRef.current?.focus();
  }, [open]);

  return (
    <Dialog
      description={
        <div className="grid gap-2">
          <p>기준 버전은 그대로 보존되고 새 버전이 추가됩니다. 제출본을 직접 수정하지 않습니다.</p>
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
      }
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button disabled={saving} onClick={onCancel} variant="secondary">
            취소
          </Button>
          <Button loading={saving} onClick={() => onConfirm({ copyContent })}>
            {nextStatus} 만들기
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      title={`새 ${nextStatus} 만들기`}
    >

        <label className="flex items-start gap-2 text-body text-neutral-900">
          <input
            checked={copyContent}
            className="mt-0.5 h-4 w-4 rounded border-neutral-200 text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            onChange={(event) => setCopyContent(event.target.checked)}
            ref={copyContentRef}
            type="checkbox"
          />
          <span>
            기준 버전의 본문을 복사해서 시작
            <span className="block text-caption text-neutral-600">
              해제하면 빈 본문으로 시작합니다. 경험 태그는 버전마다 따로 남으므로 새 버전에서 다시
              연결해야 합니다.
            </span>
          </span>
        </label>

        <p className="text-caption text-neutral-400">
          새 버전 번호와 상태는 서버가 결정합니다.
        </p>
    </Dialog>
  );
}
