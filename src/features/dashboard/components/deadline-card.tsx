import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDateTime } from "@/features/dashboard/date-utils";
import { DDayChip } from "@/features/dashboard/components/d-day-chip";
import type { UpcomingDeadline } from "@/features/dashboard/types";

interface DeadlineCardProps {
  deadline: UpcomingDeadline;
}

function getStatusVariant(status: UpcomingDeadline["status"]): "statusDraft" | "statusSubmitted" | "statusInterview" | "neutral" {
  if (status === "작성 중") {
    return "statusDraft";
  }

  if (status === "지원 완료") {
    return "statusSubmitted";
  }

  if (status === "면접") {
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
              <DDayChip date={deadline.dueAt} />
              <Badge variant={getStatusVariant(deadline.status)}>{deadline.status}</Badge>
            </div>
          </div>

          <div className="grid gap-1">
            <p className="text-caption text-neutral-600">마감일시</p>
            <p className="font-mono text-mono text-neutral-900">{formatDateTime(deadline.dueAt)}</p>
          </div>

          <ProgressBar label="체크리스트 기반 완성도" value={deadline.completionRate} />

          <div className="grid gap-2">
            <p className="text-caption text-neutral-600">다음 행동</p>
            {deadline.incompleteItems.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {deadline.incompleteItems.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body text-success-700">필수 체크리스트가 완료되었습니다.</p>
            )}
          </div>

          <LinkButton className="w-full sm:w-fit" href={deadline.detailHref} size="sm" variant="secondary">
            지원 상세 보기
          </LinkButton>
        </article>
      </CardContent>
    </Card>
  );
}
