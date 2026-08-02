import type {
  CommonQuestionType,
  EssayLibraryItem,
  EssayAnswerStatus,
  ExperienceTag,
} from "@/features/essays/types";
import type { ApplicationDetail } from "@/features/applications/detail-types";
import type { EssayAnswerDetail } from "@/features/essays/editor-types";
import type { EssayAnswerVersion } from "@/features/essays/version-types";
import type {
  CommonQuestionTypeDto,
  EssayAnswerDto,
  EssayAnswerStatusDto,
  ExperienceTagDto,
  EssayQuestionDto,
} from "@/features/essays/api/dto";

const QUESTION_TYPE_TO_VIEW: Record<CommonQuestionTypeDto, CommonQuestionType> = {
  MOTIVATION: "지원동기",
  GROWTH: "성장과정",
  PROBLEM_SOLVING: "문제해결",
  COLLABORATION: "협업갈등",
  CHALLENGE_FAILURE: "도전실패",
  JOB_COMPETENCY: "직무역량",
  FUTURE_PLAN: "입사포부",
  ETHICS_RESPONSIBILITY: "윤리책임",
  OTHER: "기타",
};

const QUESTION_TYPE_TO_DTO: Record<CommonQuestionType, CommonQuestionTypeDto> = {
  지원동기: "MOTIVATION",
  성장과정: "GROWTH",
  문제해결: "PROBLEM_SOLVING",
  협업갈등: "COLLABORATION",
  도전실패: "CHALLENGE_FAILURE",
  직무역량: "JOB_COMPETENCY",
  입사포부: "FUTURE_PLAN",
  윤리책임: "ETHICS_RESPONSIBILITY",
  기타: "OTHER",
};

const ANSWER_STATUS_TO_VIEW: Record<EssayAnswerStatusDto, EssayAnswerStatus> = {
  DRAFT: "작성본",
  SUBMITTED: "제출본",
  IMPROVED: "개선본",
};

const ANSWER_STATUS_TO_DTO: Record<EssayAnswerStatus, EssayAnswerStatusDto> = {
  작성본: "DRAFT",
  제출본: "SUBMITTED",
  개선본: "IMPROVED",
};

export function toCommonQuestionTypeViewModel(
  value: CommonQuestionTypeDto,
): CommonQuestionType {
  return QUESTION_TYPE_TO_VIEW[value];
}

export function toCommonQuestionTypeDto(
  value: CommonQuestionType,
): CommonQuestionTypeDto {
  return QUESTION_TYPE_TO_DTO[value];
}

export function toEssayAnswerStatusViewModel(
  value: EssayAnswerStatusDto,
): EssayAnswerStatus {
  return ANSWER_STATUS_TO_VIEW[value];
}

export function toEssayAnswerStatusDto(value: EssayAnswerStatus): EssayAnswerStatusDto {
  return ANSWER_STATUS_TO_DTO[value];
}

export function toExperienceTagNames(tags: ExperienceTagDto[]): ExperienceTag[] {
  return tags.map((tag) => tag.name);
}

export function toEssayLibraryItem(
  dto: EssayAnswerDto,
  application: ApplicationDetail,
  question: EssayQuestionDto | undefined,
): EssayLibraryItem {
  const contentPreview = createContentPreview(dto.content);

  return {
    answerId: String(dto.id),
    questionId: String(dto.questionId),
    applicationId: String(dto.applicationId),
    companyName: dto.companyName,
    positionName: dto.positionName,
    recruitmentYear: application.recruitmentYear,
    season: application.season,
    questionText: dto.questionText,
    commonQuestionType: question
      ? toCommonQuestionTypeViewModel(question.commonQuestionType)
      : "기타",
    experienceTags: toExperienceTagNames(dto.experienceTags),
    competencyTags: [],
    answerStatus: toEssayAnswerStatusViewModel(dto.status),
    version: dto.version,
    contentPreview,
    characterCount: dto.characterCount,
    characterLimit: question?.characterLimit ?? null,
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
    updatedAt: new Date(dto.updatedAt),
  };
}

export function toEssayAnswerDetail(
  dto: EssayAnswerDto,
  application: ApplicationDetail,
  question: EssayQuestionDto | undefined,
): EssayAnswerDetail {
  return {
    answerId: String(dto.id),
    question: {
      questionId: String(dto.questionId),
      applicationId: String(dto.applicationId),
      companyName: dto.companyName,
      positionName: dto.positionName,
      recruitmentYear: application.recruitmentYear,
      season: application.season,
      questionOrder: question?.questionOrder ?? 1,
      questionText: dto.questionText,
      characterLimit: question?.characterLimit ?? null,
      commonQuestionType: question
        ? toCommonQuestionTypeViewModel(question.commonQuestionType)
        : "기타",
    },
    content: dto.content,
    answerStatus: toEssayAnswerStatusViewModel(dto.status),
    version: dto.version,
    experienceTags: toExperienceTagNames(dto.experienceTags),
    competencyTags: [],
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
    updatedAt: new Date(dto.updatedAt),
    derivedFromVersion: dto.status === "IMPROVED" ? dto.version - 1 : null,
  };
}

export function toEssayAnswerVersion(dto: EssayAnswerDto): EssayAnswerVersion {
  return {
    versionId: String(dto.id),
    answerGroupId: String(dto.id),
    questionId: String(dto.questionId),
    versionNumber: dto.version,
    answerStatus: toEssayAnswerStatusViewModel(dto.status),
    content: dto.content,
    characterCount: dto.characterCount,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
    parentVersionId: null,
    createdReason: getVersionReason(dto.status),
    isLocked: dto.status === "SUBMITTED",
    experienceTags: toExperienceTagNames(dto.experienceTags),
    competencyTags: [],
  };
}

export function withAnswerGroupId(
  version: EssayAnswerVersion,
  answerGroupId: string,
): EssayAnswerVersion {
  return { ...version, answerGroupId };
}

function createContentPreview(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  return singleLine.length <= 150 ? singleLine : `${singleLine.slice(0, 150)}...`;
}

function getVersionReason(status: EssayAnswerStatusDto): string {
  if (status === "SUBMITTED") {
    return "제출본 저장";
  }

  if (status === "IMPROVED") {
    return "개선본 생성";
  }

  return "작성본 저장";
}
