import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const summaryItems = [
  { label: "이번 주 마감", unit: "건", value: "3" },
  { label: "다가오는 일정", unit: "개", value: "5" },
  { label: "작성 중인 지원서", unit: "건", value: "2" },
] as const;

const previewDeadlines = [
  { company: "OO전자", dday: "D-2", role: "소프트웨어 엔지니어", variant: "deadlineSoon" },
  { company: "OO은행", dday: "D-5", role: "IT 개발", variant: "deadlineWeek" },
  { company: "OO스타트업", dday: "D-9", role: "프론트엔드 개발자", variant: "deadlineUpcoming" },
] as const;

export function DashboardPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none px-6 py-8 lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-8">
        <header className="grid gap-2">
          <h1 className="text-h1 text-neutral-900">대시보드</h1>
          <p className="max-w-3xl text-body text-neutral-600">
            마감, 일정, 작성 중인 지원서를 빠르게 확인하세요.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {summaryItems.map((item) => (
            <Card key={item.label}>
              <CardContent>
                <div className="grid gap-2">
                  <p className="text-caption text-neutral-600">{item.label}</p>
                  <p className="text-display text-neutral-900">
                    {item.value}
                    <span className="ml-1 text-body-medium text-neutral-600">{item.unit}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {previewDeadlines.map((deadline) => (
            <Card key={deadline.company}>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-medium text-neutral-900">{deadline.company}</p>
                    <Badge variant={deadline.variant}>{deadline.dday}</Badge>
                  </div>
                  <p className="text-body text-neutral-600">{deadline.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
