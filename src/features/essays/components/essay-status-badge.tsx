import { Badge } from "@/components/ui/badge";
import {
  ESSAY_ANSWER_STATUS_DESCRIPTION,
  ESSAY_ANSWER_STATUS_VARIANT,
} from "@/features/essays/constants";
import type { EssayAnswerStatus } from "@/features/essays/types";

interface EssayStatusBadgeProps {
  status: EssayAnswerStatus;
  version: number;
}

/** 색만으로 상태를 구분하지 않도록 상태명과 설명을 항상 텍스트로 함께 노출한다. */
export function EssayStatusBadge({ status, version }: EssayStatusBadgeProps) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge variant={ESSAY_ANSWER_STATUS_VARIANT[status]}>
        {status === "제출본" ? `제출본 · 잠김` : status}
      </Badge>
      <span className="text-caption text-neutral-400">
        v{version} · {ESSAY_ANSWER_STATUS_DESCRIPTION[status]}
      </span>
    </span>
  );
}
