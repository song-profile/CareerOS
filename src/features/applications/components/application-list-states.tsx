import { Card, CardContent } from "@/components/ui/card";
import { ErrorStateCard, StateCard } from "@/components/ui/state-card";

export function ApplicationEmptyState() {
  return (
    <StateCard
      description="검색어를 줄이거나 상태 필터를 전체로 바꾸면 다시 확인할 수 있습니다."
      title="조건에 맞는 지원 건이 없습니다."
    />
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

export function ApplicationErrorState({
  message = "잠시 후 다시 시도하세요.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return <ErrorStateCard message={message} onRetry={onRetry} title="지원 목록을 불러올 수 없습니다." />;
}
