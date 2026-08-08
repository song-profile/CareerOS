"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/components/ui/copy-field";
import { getCredentialNumber } from "@/features/materials/materials-service";
import { cn } from "@/lib/utils/cn";

type FieldState = "idle" | "loading" | "copied" | "failed";

interface CredentialNumberFieldProps {
  credentialId: string;
  hasCredentialNumber: boolean;
  maskedValue: string;
}

export function CredentialNumberField({
  credentialId,
  hasCredentialNumber,
  maskedValue,
}: CredentialNumberFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [fullNumber, setFullNumber] = useState("");
  const [state, setState] = useState<FieldState>("idle");

  async function loadNumber(): Promise<string | null> {
    if (fullNumber) {
      return fullNumber;
    }

    setState("loading");
    const result = await getCredentialNumber(credentialId);

    if (!result.ok) {
      setState("failed");
      window.setTimeout(() => setState("idle"), 2000);
      return null;
    }

    setFullNumber(result.value);
    setState("idle");
    return result.value;
  }

  async function handleReveal() {
    if (revealed) {
      setRevealed(false);
      return;
    }

    const loaded = await loadNumber();

    if (loaded) {
      setRevealed(true);
    }
  }

  async function handleCopy() {
    const loaded = await loadNumber();

    if (!loaded) {
      return;
    }

    const succeeded = await copyToClipboard(loaded);
    setState(succeeded ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 2000);
  }

  const disabled = !hasCredentialNumber || state === "loading";
  const displayValue = hasCredentialNumber
    ? revealed && fullNumber
      ? fullNumber
      : maskedValue
    : "미입력";

  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="shrink-0 text-caption text-neutral-600">자격번호</span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 sm:justify-end">
        <span
          className={cn(
            "min-w-0 break-all font-mono text-mono",
            hasCredentialNumber ? "text-neutral-900" : "text-neutral-400",
          )}
        >
          {displayValue}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <span
            aria-live="polite"
            className={cn(
              "text-caption",
              state === "failed" ? "text-danger-600" : "text-success-700",
            )}
            role="status"
          >
            {state === "loading" ? "조회 중" : null}
            {state === "copied" ? "복사됨" : null}
            {state === "failed" ? "조회 실패" : null}
          </span>
          <Button
            aria-label={revealed ? "자격번호 가리기" : "자격번호 전체 보기"}
            disabled={disabled}
            onClick={() => void handleReveal()}
            size="sm"
            variant="ghost"
          >
            {revealed ? "가리기" : "보기"}
          </Button>
          <Button
            aria-label="자격번호 복사"
            disabled={disabled}
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
