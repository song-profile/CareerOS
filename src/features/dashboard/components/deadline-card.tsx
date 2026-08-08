import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { formatDateTime } from "@/features/dashboard/date-utils";
import { DDayChip } from "@/features/dashboard/components/d-day-chip";
import type { UpcomingDeadline } from "@/features/dashboard/types";

interface DeadlineCardProps {
  deadline: UpcomingDeadline;
}

function getStatusVariant(
  status: UpcomingDeadline["status"],
): "statusDraft" | "statusSubmitted" | "statusInterview" | "neutral" {
  if (status === "WRITING") {
    return "statusDraft";
  }

  if (status === "SUBMITTED") {
    return "statusSubmitted";
  }

  if (status === "INTERVIEW") {
    return "statusInterview";
  }

  return "neutral";
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  return (
    <Card>
      <CardContent>
        <article className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-h3 text-neutral-900">{deadline.companyName}</p>
              <p className="text-body text-neutral-600">{deadline.roleName}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DDayChip daysUntil={deadline.daysUntil} />
              <Badge variant={getStatusVariant(deadline.status)}>{deadline.statusLabel}</Badge>
            </div>
          </div>

          <div className="grid gap-1">
            <p className="text-caption text-neutral-600">마감일시</p>
            <p className="font-mono text-mono text-neutral-900">{formatDateTime(deadline.dueAt)}</p>
          </div>

          <LinkButton className="w-full sm:w-fit" href={deadline.detailHref} size="sm" variant="secondary">
            지원 상세 보기
          </LinkButton>
        </article>
      </CardContent>
    </Card>
  );
}
