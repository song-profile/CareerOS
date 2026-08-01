import type { RecruitmentSeason } from "@/features/applications/types";
import { COMMON_QUESTION_TYPES, ESSAY_ANSWER_STATUSES } from "@/features/essays/constants";
import type {
  CommonQuestionType,
  EssayAnswerStatus,
  EssayLibraryItem,
} from "@/features/essays/types";

/**
 * 백엔드 API 명세가 확정되기 전의 임시 DTO 형태.
 * 날짜는 문자열, 열거값은 문자열로 들어온다고 가정한다.
 * 실제 명세가 나오면 이 파일의 필드명과 toEssayLibraryItem만 교체하면 된다.
 */
export interface EssayLibraryItemDto {
  answerId: string;
  questionId: string;
  applicationId: string;
  companyName: string;
  positionName: string;
  recruitmentYear: number;
  season: string;
  questionText: string;
  commonQuestionType: string;
  experienceTags: string[];
  competencyTags: string[];
  answerStatus: string;
  version: number;
  contentPreview: string;
  characterCount: number;
  characterLimit: number;
  submittedAt: string | null;
  updatedAt: string;
}

const RECRUITMENT_SEASONS: RecruitmentSeason[] = ["상반기", "하반기", "수시"];

function toQuestionType(value: string): CommonQuestionType {
  return COMMON_QUESTION_TYPES.find((type) => type === value) ?? "기타";
}

function toAnswerStatus(value: string): EssayAnswerStatus {
  return ESSAY_ANSWER_STATUSES.find((status) => status === value) ?? "작성본";
}

function toSeason(value: string): RecruitmentSeason {
  return RECRUITMENT_SEASONS.find((season) => season === value) ?? "수시";
}

/** 외부 입력이므로 열거값은 검증하고, 알 수 없는 값은 안전한 기본값으로 떨어뜨린다. */
export function toEssayLibraryItem(dto: EssayLibraryItemDto): EssayLibraryItem {
  return {
    answerId: dto.answerId,
    questionId: dto.questionId,
    applicationId: dto.applicationId,
    companyName: dto.companyName,
    positionName: dto.positionName,
    recruitmentYear: dto.recruitmentYear,
    season: toSeason(dto.season),
    questionText: dto.questionText,
    commonQuestionType: toQuestionType(dto.commonQuestionType),
    experienceTags: dto.experienceTags,
    competencyTags: dto.competencyTags,
    answerStatus: toAnswerStatus(dto.answerStatus),
    version: dto.version,
    contentPreview: dto.contentPreview,
    characterCount: dto.characterCount,
    characterLimit: dto.characterLimit,
    submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
    updatedAt: new Date(dto.updatedAt),
  };
}
