"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState, type DragEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { updateApplicationStatus } from "@/features/applications/api/application-api";
import { ApplicationDDayChip } from "@/features/applications/components/application-d-day-chip";
import { ApplicationEmptyState } from "@/features/applications/components/application-list-states";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { formatDeadline } from "@/features/applications/date-utils";
import { APPLICATION_STATUS_OPTIONS } from "@/features/applications/form-options";
import {
  groupApplicationsByStatus,
  type ApplicationNextSchedule,
} from "@/features/applications/kanban-utils";
import {
  buildApplicationListHref,
  DEFAULT_APPLICATION_SEARCH_STATE,
  type ApplicationListSearchState,
} from "@/features/applications/search-params";
import type { ApplicationListItem, ApplicationStatus } from "@/features/applications/types";
import { formatEventDateTime } from "@/features/calendar/date-utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { reloadAfterMutation } from "@/lib/api/mutation";
import { cn } from "@/lib/utils/cn";

/** 드래그로 옮기는 값은 지원 건 id 하나뿐이라 표준 text/plain을 그대로 쓴다. */
const DRAG_DATA_TYPE = "text/plain";

interface ToastState {
  tone: "success" | "error";
  message: string;
}

export interface ApplicationKanbanBoardProps {
  applications: ApplicationListItem[];
  nextSchedules: Record<string, ApplicationNextSchedule>;
  searchState: ApplicationListSearchState;
}

export function ApplicationKanbanBoard({
  applications,
  nextSchedules,
  searchState,
}: ApplicationKanbanBoardProps) {
  const router = useRouter();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ApplicationStatus>>({});
  const [pendingId, setPendingId] = useState("");
  const [dragOverStatus, setDragOverStatus] = useState<ApplicationStatus | "">("");
  const [toast, setToast] = useState<ToastState | null>(null);

  // 상태를 바꾼 카드만 새 객체가 되므로, 나머지 카드는 참조가 유지되어 다시 그리지 않는다.
  const items = useMemo(
    () =>
      applications.map((application) => {
        const override = statusOverrides[application.id];
        return override && override !== application.status
          ? { ...application, status: override }
          : application;
      }),
    [applications, statusOverrides],
  );

  const columns = useMemo(() => groupApplicationsByStatus(items), [items]);

  const changeStatus = useCallback(
    async (application: ApplicationListItem, nextStatus: ApplicationStatus) => {
      if (application.status === nextStatus) {
        return;
      }

      const previousStatus = application.status;
      setStatusOverrides((current) => ({ ...current, [application.id]: nextStatus }));
      setPendingId(application.id);
      setToast(null);

      try {
        // 상세 화면과 같은 상태 변경 API다. 백엔드가 여기서 상태 이력을 남긴다.
        await updateApplicationStatus(application.id, nextStatus);
        setToast({
          tone: "success",
          message: `${application.companyName} 상태를 ${nextStatus}(으)로 변경했습니다.`,
        });
        reloadAfterMutation(router);
      } catch (error) {
        setStatusOverrides((current) => ({ ...current, [application.id]: previousStatus }));
        setToast({ tone: "error", message: getApiErrorMessage(error, "지원 상태를 변경") });
      } finally {
        setPendingId("");
      }
    },
    [router],
  );

  const handleDragStart = useCallback((event: DragEvent<HTMLElement>, applicationId: string) => {
    event.dataTransfer.setData(DRAG_DATA_TYPE, applicationId);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => setDragOverStatus(""), []);

  function handleDragOver(event: DragEvent<HTMLElement>, status: ApplicationStatus) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, status: ApplicationStatus) {
    event.preventDefault();
    setDragOverStatus("");

    const applicationId = event.dataTransfer.getData(DRAG_DATA_TYPE);
    const application = items.find((item) => item.id === applicationId);

    if (application) {
      void changeStatus(application, status);
    }
  }

  const hasFilter =
    searchState.keyword.trim().length > 0 ||
    searchState.status !== DEFAULT_APPLICATION_SEARCH_STATE.status;

  return (
    <div className="grid gap-4">
      <p className="text-caption text-neutral-600">
        총 {items.length}건입니다. 카드를 다른 컬럼으로 끌어 놓거나, 카드 안의 상태 선택으로 변경할
        수 있습니다. 변경 내역은 지원 상세의 상태 이력에 남습니다.
      </p>

      {hasFilter ? (
        <p className="text-caption text-neutral-600">
          검색·상태 필터가 적용된 결과만 칸반에 표시됩니다.{" "}
          <Link
            className="text-primary-700 underline"
            href={buildApplicationListHref({ ...searchState, keyword: "", status: "전체" })}
          >
            필터 해제
          </Link>
        </p>
      ) : null}

      {items.length === 0 ? (
        <ApplicationEmptyState />
      ) : (
        <div className="grid gap-4 lg:flex lg:items-start lg:overflow-x-auto lg:pb-2">
          {columns.map((column) => (
            <section
              aria-label={`${column.status} ${column.applications.length}건`}
              className={cn(
                "grid gap-3 rounded-card border bg-neutral-50 p-3 lg:w-72 lg:shrink-0",
                dragOverStatus === column.status
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200",
              )}
              key={column.status}
              onDragOver={(event) => handleDragOver(event, column.status)}
              onDrop={(event) => handleDrop(event, column.status)}
            >
              <div className="flex items-center justify-between gap-2">
                <ApplicationStatusBadge status={column.status} />
                <span className="font-mono text-mono text-neutral-600">
                  {column.applications.length}
                </span>
              </div>

              {column.applications.length === 0 ? (
                <p className="rounded-control border border-dashed border-neutral-200 p-3 text-caption text-neutral-400">
                  해당 상태의 지원 건이 없습니다.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {column.applications.map((application) => (
                    <ApplicationKanbanCard
                      application={application}
                      isPending={pendingId === application.id}
                      key={application.id}
                      nextSchedule={nextSchedules[application.id]}
                      onDragEnd={handleDragEnd}
                      onDragStart={handleDragStart}
                      onStatusChange={changeStatus}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {toast ? <Toast tone={toast.tone}>{toast.message}</Toast> : null}
    </div>
  );
}

interface ApplicationKanbanCardProps {
  application: ApplicationListItem;
  isPending: boolean;
  nextSchedule?: ApplicationNextSchedule;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, applicationId: string) => void;
  onStatusChange: (application: ApplicationListItem, nextStatus: ApplicationStatus) => void;
}

/**
 * 지원 건이 많아도 상태가 바뀐 카드만 다시 그리도록 memo를 건다.
 * 부모가 넘기는 핸들러는 useCallback으로 고정되어 있다.
 */
const ApplicationKanbanCard = memo(function ApplicationKanbanCard({
  application,
  isPending,
  nextSchedule,
  onDragEnd,
  onDragStart,
  onStatusChange,
}: ApplicationKanbanCardProps) {
  return (
    <li>
      {/* 터치 기기에서는 HTML5 드래그가 발생하지 않는다. 모바일은 아래 상태 선택으로 바꾼다. */}
      <Card
        aria-busy={isPending || undefined}
        className={cn("lg:cursor-grab", isPending && "opacity-60")}
        draggable
        onDragEnd={onDragEnd}
        onDragStart={(event) => onDragStart(event, application.id)}
      >
        <CardContent className="grid gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <Link
              className="text-body-medium text-neutral-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              href={`/applications/${application.id}`}
            >
              {application.companyName}
            </Link>
            <ApplicationDDayChip deadline={application.deadline} />
          </div>

          <p className="text-caption text-neutral-600">{application.position}</p>
          <p className="font-mono text-mono text-neutral-600">
            {formatDeadline(application.deadline)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            <span className="text-caption text-neutral-600">
              {nextSchedule
                ? `다음 일정 ${nextSchedule.label} · ${formatEventDateTime(nextSchedule.startAt)}`
                : "다음 일정 없음"}
            </span>
          </div>

          <Select
            aria-label={`${application.companyName} 상태 변경`}
            className="h-8 text-caption"
            onChange={(event) =>
              onStatusChange(application, event.target.value as ApplicationStatus)
            }
            options={APPLICATION_STATUS_OPTIONS}
            value={application.status}
          />

          {isPending ? <p className="text-caption text-neutral-600">상태 변경 중입니다.</p> : null}
        </CardContent>
      </Card>
    </li>
  );
});
