import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary as DashboardSummaryType } from "@/features/dashboard/types";

const summaryItems = [
  {
    key: "weeklyDeadlineCount",
    label: "이번 주 마감",
    unit: "건",
  },
  {
    key: "upcomingEventCount",
    label: "다가오는 일정",
    unit: "개",
  },
  {
    key: "draftingApplicationCount",
    label: "작성 중인 지원서",
    unit: "건",
  },
] as const;

interface DashboardSummaryProps {
  summary: DashboardSummaryType;
}

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <section className="grid gap-4" aria-labelledby="dashboard-summary-title">
      <div className="grid gap-2">
        <p className="text-caption text-primary-600">오늘의 요약</p>
        <h1 className="text-h1 text-neutral-900" id="dashboard-summary-title">
          안녕하세요, 사용자님
        </h1>
        <p className="text-body text-neutral-600">
          임박한 마감과 일정, 준비가 필요한 자료를 먼저 확인하세요.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {summaryItems.map((item) => (
          <Card key={item.key}>
            <CardContent>
              <div className="grid gap-2">
                <p className="text-caption text-neutral-600">{item.label}</p>
                <p className="text-display text-neutral-900">
                  {summary[item.key]}
                  <span className="ml-1 text-body-medium text-neutral-600">{item.unit}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
