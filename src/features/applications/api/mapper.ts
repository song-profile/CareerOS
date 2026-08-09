import type {
  ApplicationDetail,
  ApplicationChangeHistory,
} from "@/features/applications/detail-types";
import type { ApplicationSavePayload } from "@/features/applications/form-types";
import type {
  ApplicationListItem,
  ApplicationStatus,
  RecruitmentSeason,
} from "@/features/applications/types";
import type {
  ApplicationDto,
  ApplicationResourcesDto,
  ApplicationRequestDto,
  ApplicationStatusDto,
  ApplicationUpdateRequestDto,
  RecruitmentSeasonDto,
} from "@/features/applications/api/dto";

const STATUS_TO_VIEW: Record<ApplicationStatusDto, ApplicationStatus> = {
  INTERESTED: "관심",
  WRITING: "작성중",
  SUBMITTED: "지원완료",
  DOCUMENT_RESULT: "서류",
  TEST: "필기",
  INTERVIEW: "면접",
  FINAL_ACCEPTED: "최종합격",
  FINAL_REJECTED: "불합격",
};

const STATUS_TO_DTO: Record<ApplicationStatus, ApplicationStatusDto> = {
  관심: "INTERESTED",
  작성중: "WRITING",
  지원완료: "SUBMITTED",
  서류: "DOCUMENT_RESULT",
  필기: "TEST",
  면접: "INTERVIEW",
  최종합격: "FINAL_ACCEPTED",
  불합격: "FINAL_REJECTED",
};

const SEASON_TO_VIEW: Record<RecruitmentSeasonDto, RecruitmentSeason> = {
  FIRST_HALF: "상반기",
  SECOND_HALF: "하반기",
  ROLLING: "수시",
};

const SEASON_TO_DTO: Record<RecruitmentSeason, RecruitmentSeasonDto> = {
  상반기: "FIRST_HALF",
  하반기: "SECOND_HALF",
  수시: "ROLLING",
};

export function toApplicationStatusViewModel(status: ApplicationStatusDto): ApplicationStatus {
  return STATUS_TO_VIEW[status];
}

export function toApplicationStatusDto(status: ApplicationStatus): ApplicationStatusDto {
  return STATUS_TO_DTO[status];
}

export function toRecruitmentSeasonViewModel(season: RecruitmentSeasonDto): RecruitmentSeason {
  return SEASON_TO_VIEW[season];
}

export function toRecruitmentSeasonDto(season: RecruitmentSeason): RecruitmentSeasonDto {
  return SEASON_TO_DTO[season];
}

export function toApplicationListItem(dto: ApplicationDto): ApplicationListItem {
  const createdAt = toDate(dto.createdAt);

  return {
    id: String(dto.id),
    companyName: dto.companyName,
    position: dto.positionName,
    recruitmentYear: dto.recruitmentYear,
    season: toRecruitmentSeasonViewModel(dto.season),
    deadline: toOptionalDate(dto.deadlineAt) ?? createdAt,
    status: toApplicationStatusViewModel(dto.status),
    progress: getProgress(dto.status),
    createdAt,
  };
}

export function toApplicationDetail(dto: ApplicationDto): ApplicationDetail {
  return {
    ...toApplicationListItem(dto),
    basicInfo: {
      postingUrl: dto.postingUrl ?? "",
      workLocation: dto.workLocation ?? "",
      applicationStartAt: toOptionalDate(dto.applicationStartAt),
      memo: dto.memo ?? "",
    },
    materials: [],
    essay: {
      questionCount: 0,
      answerCount: 0,
      hasSubmittedVersion: Boolean(dto.submittedAt),
      href: `/essays?application=${dto.id}`,
    },
    checklist: [],
    histories: dto.statusHistories.map(toApplicationChangeHistory),
  };
}

export function mergeApplicationResources(
  detail: ApplicationDetail,
  resources: ApplicationResourcesDto,
): ApplicationDetail {
  return {
    ...detail,
    materials: [
      ...resources.files.map((file) => ({
        id: `file-${file.fileAssetId}`,
        type: toApplicationMaterialType(file.category),
        title: file.displayName,
        isReady: true,
        placeholderHref: file.downloadUrl,
      })),
      ...resources.credentials.map((credential) => ({
        id: `credential-${credential.credentialId}`,
        type: "자격증" as const,
        title: credential.name,
        isReady: true,
        placeholderHref: `/materials/credentials/${credential.credentialId}`,
      })),
      ...resources.externalLinks.map((link) => ({
        id: `link-${link.externalLinkId}`,
        type: "포트폴리오" as const,
        title: link.displayName,
        isReady: true,
        placeholderHref: link.url,
      })),
    ],
    essay: {
      questionCount: resources.essayQuestions.length,
      answerCount: resources.essayQuestions.filter((question) => question.hasSubmittedAnswer).length,
      hasSubmittedVersion: resources.essayQuestions.some((question) => question.hasSubmittedAnswer),
      href: `/essays?application=${resources.applicationId}`,
    },
  };
}

export function toApplicationCreateRequest(payload: ApplicationSavePayload): ApplicationRequestDto {
  return {
    ...toApplicationUpdateRequest(payload),
    status: toApplicationStatusDto(payload.status),
  };
}

export function toApplicationUpdateRequest(
  payload: ApplicationSavePayload,
): ApplicationUpdateRequestDto {
  return {
    companyName: payload.companyName,
    companyHomepageUrl: null,
    companyMemo: null,
    positionName: payload.position,
    recruitmentTitle: null,
    recruitmentYear: payload.recruitmentYear,
    season: toRecruitmentSeasonDto(payload.season),
    postingUrl: emptyToNull(payload.postingUrl),
    applicationStartAt: toInstantString(payload.startDate),
    deadlineAt: toInstantString(payload.deadline),
    workLocation: emptyToNull(payload.workLocation),
    applicationSiteUrl: null,
    memo: emptyToNull(payload.memo),
  };
}

function toApplicationChangeHistory(
  dto: ApplicationDto["statusHistories"][number],
): ApplicationChangeHistory {
  return {
    id: String(dto.id),
    status: toApplicationStatusViewModel(dto.newStatus),
    changedAt: toDate(dto.changedAt),
    changedBy: "시스템",
  };
}

function toApplicationMaterialType(category: string) {
  if (category === "PROFILE_PHOTO") {
    return "증명사진" as const;
  }

  if (category === "PORTFOLIO") {
    return "포트폴리오" as const;
  }

  if (category === "TRANSCRIPT") {
    return "성적증명서" as const;
  }

  return "자격증" as const;
}

function getProgress(status: ApplicationStatusDto): number {
  const progressByStatus: Record<ApplicationStatusDto, number> = {
    INTERESTED: 10,
    WRITING: 30,
    SUBMITTED: 50,
    DOCUMENT_RESULT: 60,
    TEST: 70,
    INTERVIEW: 85,
    FINAL_ACCEPTED: 100,
    FINAL_REJECTED: 100,
  };

  return progressByStatus[status];
}

function toDate(value: string): Date {
  return new Date(value);
}

function toOptionalDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

function toInstantString(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
