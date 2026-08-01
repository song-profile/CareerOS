import type { EssaySaveStatus } from "@/features/essays/editor-types";
import { cn } from "@/lib/utils/cn";

function formatSavedAt(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusClassName: Record<EssaySaveStatus, string> = {
  idle: "text-neutral-600",
  dirty: "text-urgent-amber",
  saving: "text-neutral-600",
  saved: "text-success-700",
  error: "text-danger-600",
};

interface SaveStatusIndicatorProps {
  status: EssaySaveStatus;
  savedAt: Date | null;
}

/** 저장 상태 변경을 aria-live로 알린다. */
export function SaveStatusIndicator({ savedAt, status }: SaveStatusIndicatorProps) {
  const label: Record<EssaySaveStatus, string> = {
    idle: savedAt ? `최종 저장 ${formatSavedAt(savedAt)}` : "저장된 변경사항 없음",
    dirty: "저장되지 않은 변경사항 있음",
    saving: "저장 중",
    saved: savedAt ? `저장됨 · ${formatSavedAt(savedAt)}` : "저장됨",
    error: "저장 실패",
  };

  return (
    <p
      aria-live="polite"
      className={cn("min-h-5 text-caption", statusClassName[status])}
      role="status"
    >
      {label[status]}
    </p>
  );
}
