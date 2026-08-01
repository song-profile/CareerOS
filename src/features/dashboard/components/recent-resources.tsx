import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DashboardEmptyState, DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { formatRelativeOpenedAt } from "@/features/dashboard/date-utils";
import type { RecentResource } from "@/features/dashboard/types";

interface RecentResourcesProps {
  resources: RecentResource[];
}

export function RecentResources({ resources }: RecentResourcesProps) {
  return (
    <DashboardSection
      description="최근 확인한 자소서와 파일을 빠르게 다시 열 수 있습니다."
      title="최근 열어본 자료"
    >
      {resources.length === 0 ? (
        <DashboardEmptyState
          description="자소서나 파일을 열면 최근 자료가 여기에 표시됩니다."
          title="최근 열어본 자료가 없습니다."
        />
      ) : (
        <div className="grid gap-3">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={resource.type === "자소서" ? "primary" : "neutral"}>
                          {resource.type}
                        </Badge>
                        <p className="text-body-medium text-neutral-900">{resource.title}</p>
                      </div>
                      <p className="text-body text-neutral-600">{resource.context}</p>
                    </div>
                    <p className="font-mono text-mono text-neutral-600">
                      {formatRelativeOpenedAt(resource.lastOpenedAt)}
                    </p>
                  </div>
                  <LinkButton className="w-full sm:w-fit" href={resource.href} size="sm" variant="secondary">
                    자료 열기
                  </LinkButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
