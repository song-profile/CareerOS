import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils/cn";
import { ApplicationDDayChip } from "@/features/applications/components/application-d-day-chip";
import { ApplicationDeleteDialog } from "@/features/applications/components/application-delete-dialog";
import { ApplicationStatusBadge } from "@/features/applications/components/application-status-badge";
import { formatDeadline } from "@/features/applications/date-utils";
import type {
  ApplicationChecklistItem,
  ApplicationDetail,
  ApplicationTimelineStep,
} from "@/features/applications/detail-types";
import type { ApplicationStatus } from "@/features/applications/types";

interface ApplicationDetailProps {
  application: ApplicationDetail;
}

const timelineSteps: ApplicationTimelineStep[] = [
  "관심",
  "작성중",
  "지원완료",
  "서류",
  "필기",
  "면접",
  "최종",
];

const timelineOrder: Record<ApplicationTimelineStep, number> = timelineSteps.reduce(
  (order, step, index) => ({ ...order, [step]: index }),
  {} as Record<ApplicationTimelineStep, number>,
);

function getTimelineCurrentStep(status: ApplicationStatus): ApplicationTimelineStep {
  if (status === "최종합격" || status === "불합격") {
    return "최종";
  }

  return status;
}

function getChecklistProgress(checklist: ApplicationChecklistItem[]): number {
  if (checklist.length === 0) {
    return 0;
  }

  const completedCount = checklist.filter((item) => item.isCompleted).length;
  return Math.round((completedCount / checklist.length) * 100);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ApplicationDetailView({ application }: ApplicationDetailProps) {
  return (
    <div className="grid gap-8">
      <ApplicationDetailHero application={application} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <ApplicationBasicInfoSection application={application} />
          <ApplicationTimelineSection status={application.status} />
          <ApplicationMaterialsSection application={application} />
          <ApplicationEssaySection application={application} />
        </div>

        <div className="grid content-start gap-6">
          <ApplicationChecklistSection checklist={application.checklist} />
          <ApplicationHistorySection application={application} />
        </div>
      </div>
    </div>
  );
}

function ApplicationDetailHero({ application }: ApplicationDetailProps) {
  return (
    <Card variant="highlight">
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>
                  {application.recruitmentYear} {application.season}
                </Badge>
                <ApplicationStatusBadge status={application.status} />
                <ApplicationDDayChip deadline={application.deadline} />
              </div>
              <div className="grid gap-1">
                <h2 className="text-display text-neutral-900">{application.companyName}</h2>
                <p className="text-h2 text-neutral-700">{application.position}</p>
              </div>
            </div>
            <p className="font-mono text-mono text-neutral-600">
              지원 마감: {formatDeadline(application.deadline)}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <LinkButton href="/applications" variant="secondary">
              목록으로
            </LinkButton>
            <LinkButton href={`/applications/${application.id}/edit`}>
              수정
            </LinkButton>
            <ApplicationDeleteDialog companyName={application.companyName} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationBasicInfoSection({ application }: ApplicationDetailProps) {
  const infoItems = [
    { label: "회사", value: application.companyName },
    { label: "직무", value: application.position },
    {
      label: "공고 URL",
      value: application.basicInfo.postingUrl ? (
        <a
          className="text-primary-600 underline-offset-4 hover:underline"
          href={application.basicInfo.postingUrl}
          rel="noreferrer"
          target="_blank"
        >
          {application.basicInfo.postingUrl}
        </a>
      ) : (
        "등록된 공고 URL이 없습니다."
      ),
    },
    { label: "근무지역", value: application.basicInfo.workLocation },
    { label: "메모", value: application.basicInfo.memo || "등록된 메모가 없습니다." },
  ];

  return (
    <DetailSection description="지원 건의 핵심 정보를 한곳에서 확인합니다." title="기본정보">
      <dl className="grid gap-4">
        {infoItems.map((item) => (
          <div className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4" key={item.label}>
            <dt className="text-body-medium text-neutral-600">{item.label}</dt>
            <dd className="break-words text-body text-neutral-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </DetailSection>
  );
}

function ApplicationTimelineSection({ status }: { status: ApplicationStatus }) {
  const currentStep = getTimelineCurrentStep(status);
  const currentIndex = timelineOrder[currentStep];

  return (
    <DetailSection description="현재 전형 단계가 어디인지 빠르게 확인합니다." title="지원 진행현황">
      <ol className="grid gap-3 md:grid-cols-7">
        {timelineSteps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <li className="relative" key={step}>
              <div
                className={cn(
                  "grid gap-2 rounded-control border p-3",
                  isCurrent
                    ? "border-primary-100 bg-primary-50 text-primary-700"
                    : "border-neutral-200 bg-neutral-0 text-neutral-600",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-caption font-semibold",
                    isCurrent
                      ? "border-primary-500 bg-primary-600 text-white"
                      : isCompleted
                        ? "border-success-100 bg-success-50 text-success-700"
                        : "border-neutral-200 bg-neutral-50 text-neutral-400",
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-body-medium">{step}</span>
                <span className="text-caption">
                  {isCurrent ? "현재 단계" : isCompleted ? "완료" : "예정"}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </DetailSection>
  );
}

function ApplicationMaterialsSection({ application }: ApplicationDetailProps) {
  return (
    <DetailSection description="제출에 필요한 파일 준비 상태입니다." title="제출자료">
      {application.materials.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {application.materials.map((material) => (
            <a
              className="grid gap-2 rounded-control border border-neutral-200 bg-neutral-0 p-3 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              href={material.placeholderHref}
              key={material.id}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-body-medium text-neutral-900">{material.type}</span>
                <Badge variant={material.isReady ? "success" : "neutral"}>
                  {material.isReady ? "준비 완료" : "확인 필요"}
                </Badge>
              </div>
              <span className="text-body text-neutral-600">{material.title}</span>
              <span className="text-caption text-primary-600">파일 클릭 placeholder</span>
            </a>
          ))}
        </div>
      ) : (
        <ApplicationSectionEmptyState message="아직 연결된 제출자료가 없습니다." />
      )}
    </DetailSection>
  );
}

function ApplicationEssaySection({ application }: ApplicationDetailProps) {
  const { essay } = application;

  return (
    <DetailSection description="지원 건과 연결된 자소서 작성 현황입니다." title="자소서">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatItem label="등록 문항" value={`${essay.questionCount}개`} />
          <StatItem label="작성 답변" value={`${essay.answerCount}개`} />
          <StatItem label="제출본" value={essay.hasSubmittedVersion ? "있음" : "없음"} />
        </div>
        <LinkButton href={essay.href} variant="secondary">
          자소서 화면 이동
        </LinkButton>
      </div>
    </DetailSection>
  );
}

function ApplicationChecklistSection({ checklist }: { checklist: ApplicationChecklistItem[] }) {
  const progress = getChecklistProgress(checklist);

  return (
    <DetailSection description="지원 전 최종 확인해야 할 항목입니다." title="체크리스트">
      {checklist.length > 0 ? (
        <div className="grid gap-4">
          <ProgressBar label="체크리스트 진행률" value={progress} />
          <div className="grid gap-3">
            {checklist.map((item) => (
              <label
                className="flex items-center gap-3 rounded-control border border-neutral-200 bg-neutral-0 p-3 text-body text-neutral-900"
                key={item.id}
              >
                <input
                  checked={item.isCompleted}
                  className="h-4 w-4 rounded border-neutral-200 text-primary-600 focus:ring-primary-500"
                  readOnly
                  type="checkbox"
                />
                <span>{item.label}</span>
                <span className="ml-auto text-caption text-neutral-600">
                  {item.isCompleted ? "완료" : "미완료"}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <ApplicationSectionEmptyState message="체크리스트 항목이 없습니다." />
      )}
    </DetailSection>
  );
}

function ApplicationHistorySection({ application }: ApplicationDetailProps) {
  return (
    <DetailSection description="지원 상태가 변경된 기록입니다." title="최근 변경 이력">
      {application.histories.length > 0 ? (
        <ol className="grid gap-3">
          {application.histories.map((history) => (
            <li className="grid gap-2 rounded-control border border-neutral-200 bg-neutral-0 p-3" key={history.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ApplicationStatusBadge status={history.status} />
                <time className="font-mono text-mono text-neutral-600" dateTime={history.changedAt.toISOString()}>
                  {formatDateTime(history.changedAt)}
                </time>
              </div>
              <p className="text-caption text-neutral-600">변경 사용자: {history.changedBy}</p>
            </li>
          ))}
        </ol>
      ) : (
        <ApplicationSectionEmptyState message="아직 변경 이력이 없습니다." />
      )}
    </DetailSection>
  );
}

function DetailSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="grid gap-1">
          <h2 className="text-h2 text-neutral-900">{title}</h2>
          <p className="text-body text-neutral-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-control border border-neutral-200 bg-neutral-50 p-3">
      <span className="text-caption text-neutral-600">{label}</span>
      <span className="text-h3 text-neutral-900">{value}</span>
    </div>
  );
}

function ApplicationSectionEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-control border border-dashed border-neutral-200 bg-neutral-50 p-4 text-body text-neutral-600">
      {message}
    </div>
  );
}

export function ApplicationDetailEmptyState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <h2 className="text-h2 text-neutral-900">지원 건을 찾을 수 없습니다.</h2>
          <p className="text-body text-neutral-600">
            목 데이터에 없는 지원 건입니다. 목록에서 다시 선택하세요.
          </p>
          <LinkButton className="w-full sm:w-fit" href="/applications" variant="secondary">
            지원 목록으로 돌아가기
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationDetailLoadingState() {
  return (
    <Card aria-label="지원 상세 Loading 구조">
      <CardHeader>
        <div className="grid gap-1">
          <h2 className="text-h3 text-neutral-900">Loading 구조</h2>
          <p className="text-body text-neutral-600">API 연동 시 상세 섹션별 Skeleton을 표시합니다.</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3" aria-hidden="true">
          <div className="h-5 w-1/3 rounded bg-neutral-100" />
          <div className="h-4 w-2/3 rounded bg-neutral-100" />
          <div className="grid gap-2">
            <div className="h-10 rounded-control bg-neutral-100" />
            <div className="h-10 rounded-control bg-neutral-100" />
            <div className="h-10 rounded-control bg-neutral-100" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationDetailErrorState() {
  return (
    <Card aria-label="지원 상세 Error State 구조">
      <CardHeader>
        <div className="grid gap-1">
          <h2 className="text-h3 text-neutral-900">Error State 구조</h2>
          <p className="text-body text-neutral-600">상세 정보를 불러오지 못했을 때 사용할 안내입니다.</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <p className="text-body-medium text-neutral-900">지원 정보를 불러오지 못했습니다.</p>
          <p className="text-body text-neutral-600">잠시 후 다시 시도하세요. 서버 내부 오류 내용은 표시하지 않습니다.</p>
          <Button size="sm" variant="secondary">
            다시 시도 placeholder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
