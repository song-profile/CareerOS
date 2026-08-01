import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ApplicationEmptyState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-1">
          <p className="text-body-medium text-neutral-900">조건에 맞는 지원 건이 없습니다.</p>
          <p className="text-body text-neutral-600">
            검색어를 줄이거나 상태 필터를 전체로 바꾸면 다시 확인할 수 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationLoadingState() {
  return (
    <Card aria-label="지원 목록을 불러오는 중입니다.">
      <CardContent>
        <div className="grid gap-3">
          <div className="h-4 w-1/3 rounded-full bg-neutral-100" />
          <div className="h-10 rounded-control bg-neutral-100" />
          <div className="h-10 rounded-control bg-neutral-100" />
          <div className="h-10 rounded-control bg-neutral-100" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationErrorState() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">지원 목록을 불러올 수 없습니다.</p>
            <p className="text-body text-neutral-600">잠시 후 다시 시도하세요.</p>
          </div>
          <Button size="sm" variant="secondary">
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
