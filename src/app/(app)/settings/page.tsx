import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        description="계정과 외부 서비스 연결 상태를 관리합니다."
        title="설정"
      />
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-h2 text-neutral-900">외부 서비스</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <p className="text-body-medium text-neutral-900">Google Calendar</p>
                <p className="text-body text-neutral-600">
                  CareerDock 일정의 Google Calendar 동기화 권한을 연결하거나 해제합니다.
                </p>
              </div>
              <LinkButton href="/settings/calendar" variant="secondary">
                관리
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
