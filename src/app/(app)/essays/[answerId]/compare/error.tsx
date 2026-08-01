"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** 오류 원인은 화면에 노출하지 않고 재시도 경로만 제공한다. */
export default function EssayVersionCompareError({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <PageHeader description="두 버전을 나란히 비교합니다." title="버전 비교" />
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <p className="text-body-medium text-neutral-900">비교 화면을 불러올 수 없습니다.</p>
              <p className="text-body text-neutral-600">잠시 후 다시 시도해 주세요.</p>
            </div>
            <Button className="w-full sm:w-fit" onClick={reset} size="sm" variant="secondary">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
