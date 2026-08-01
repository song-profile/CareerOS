import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { DashboardEmptyState, DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { formatDateTime } from "@/features/dashboard/date-utils";
import type { ExpiringCredential } from "@/features/dashboard/types";

interface ExpiringCredentialsProps {
  credentials: ExpiringCredential[];
}

export function ExpiringCredentials({ credentials }: ExpiringCredentialsProps) {
  return (
    <DashboardSection
      description="30일 전후로 다시 확인해야 할 자격증, 어학, 증빙자료입니다."
      title="만료 예정 자료"
    >
      {credentials.length === 0 ? (
        <DashboardEmptyState
          description="곧 만료될 자료가 생기면 이 영역에서 먼저 알려드립니다."
          title="만료 예정 자료가 없습니다."
        />
      ) : (
        <div className="grid gap-3">
          {credentials.map((credential) => (
            <Card key={credential.id}>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid gap-1">
                      <p className="text-body-medium text-neutral-900">{credential.name}</p>
                      <p className="font-mono text-mono text-neutral-600">
                        만료일 {formatDateTime(credential.expiresAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{credential.type}</Badge>
                      <Badge variant={credential.remainingDays <= 30 ? "deadlineSoon" : "deadlineUpcoming"}>
                        {credential.remainingDays}일 남음
                      </Badge>
                    </div>
                  </div>
                  <LinkButton className="w-full sm:w-fit" href={credential.detailHref} size="sm" variant="secondary">
                    자료 상세 보기
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
