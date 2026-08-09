"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/components/ui/copy-field";
import { fetchCredentialNumber } from "@/features/materials/api/credential-api";
import { getApiErrorMessage } from "@/lib/api/errors";

interface CredentialNumberFieldProps {
  credentialId: string;
  /** 서버가 이미 가려서 내려준 값. 기본 표시는 항상 이 값이다. */
  maskedValue: string;
  hasCredentialNumber: boolean;
}

/**
 * 자격번호 표시. 평문은 화면에 처음부터 내려오지 않는다.
 *
 * MaskedField와 달리 "보기"를 누른 시점에 서버에서 평문을 가져온다. 그 조회는
 * 백엔드에 접근 기록을 남기므로, 한 번 받은 값은 이 컴포넌트가 들고 있다가 재사용해
 * 같은 화면에서 열고 닫기를 반복해도 기록이 늘지 않는다.
 * 값은 상태로만 두고 브라우저 저장소에는 아무것도 남기지 않는다.
 */
export function CredentialNumberField({
  credentialId,
  hasCredentialNumber,
  maskedValue,
}: CredentialNumberFieldProps) {
  const [plainNumber, setPlainNumber] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadNumber(): Promise<string | null> {
    if (plainNumber !== null) {
      return plainNumber;
    }

    setLoading(true);
    setNotice("");

    try {
      const value = await fetchCredentialNumber(credentialId);
      setPlainNumber(value);
      return value;
    } catch (error) {
      // 값은 어떤 경로로도 메시지에 넣지 않는다.
      setNotice(getApiErrorMessage(error, "자격번호를 조회"));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    if (revealed) {
      setRevealed(false);
      return;
    }

    if (await loadNumber()) {
      setRevealed(true);
    }
  }

  async function handleCopy() {
    const value = await loadNumber();

    if (!value) {
      return;
    }

    const succeeded = await copyToClipboard(value);
    setNotice(succeeded ? "복사됨" : "복사 실패");
    window.setTimeout(() => setNotice(""), 2000);
  }

  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-caption text-neutral-600">자격번호</span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 sm:justify-end">
        <span
          className={`min-w-0 break-all font-mono text-mono ${
            hasCredentialNumber ? "text-neutral-900" : "text-neutral-400"
          }`}
        >
          {!hasCredentialNumber
            ? "미입력"
            : revealed && plainNumber !== null
              ? plainNumber
              : maskedValue}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <span aria-live="polite" className="text-caption text-neutral-600" role="status">
            {notice}
          </span>
          <Button
            aria-label={revealed ? "자격번호 가리기" : "자격번호 전체 보기"}
            disabled={!hasCredentialNumber || loading}
            onClick={() => void handleToggle()}
            size="sm"
            variant="ghost"
          >
            {revealed ? "가리기" : "보기"}
          </Button>
          <Button
            aria-label="자격번호 복사"
            disabled={!hasCredentialNumber || loading}
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
