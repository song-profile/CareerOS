import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/features/applications/types";

const statusVariant: Record<
  ApplicationStatus,
  "neutral" | "primary" | "success" | "danger" | "statusDraft" | "statusSubmitted" | "statusInterview"
> = {
  관심: "neutral",
  작성중: "statusDraft",
  지원완료: "statusSubmitted",
  서류: "primary",
  필기: "primary",
  면접: "statusInterview",
  최종합격: "success",
  불합격: "danger",
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
