import type { RecruitmentSeason } from "@/features/applications/types";

export type CommonQuestionType =
  | "지원동기"
  | "성장과정"
  | "문제해결"
  | "협업갈등"
  | "도전실패"
  | "직무역량"
  | "입사포부"
  | "윤리책임"
  | "기타";

export type EssayAnswerStatus = "작성본" | "제출본" | "개선본";

/** 태그는 서버에서 내려오는 사용자 정의 값이므로 유니온이 아닌 문자열이다. */
export type ExperienceTag = string;
export type CompetencyTag = string;

export interface EssayLibraryItem {
  answerId: string;
  questionId: string;
  applicationId: string;
  companyName: string;
  positionName: string;
  recruitmentYear: number;
  season: RecruitmentSeason;
  questionText: string;
  commonQuestionType: CommonQuestionType;
  experienceTags: ExperienceTag[];
  competencyTags: CompetencyTag[];
  answerStatus: EssayAnswerStatus;
  version: number;
  contentPreview: string;
  characterCount: number;
  /** 제한 글자 수가 없는 문항은 null이다. */
  characterLimit: number | null;
  submittedAt: Date | null;
  updatedAt: Date;
}

export type EssaySortOption =
  | "updatedDesc"
  | "updatedAsc"
  | "companyAsc"
  | "characterCountDesc"
  | "submittedDesc";

export interface EssayLibraryFilters {
  query: string;
  companies: string[];
  positions: string[];
  questionTypes: CommonQuestionType[];
  experienceTags: ExperienceTag[];
  statuses: EssayAnswerStatus[];
  years: number[];
  sort: EssaySortOption;
}

/** 다중 선택 필터 그룹의 키. 활성 필터 해제와 URL 직렬화가 이 키로 동작한다. */
export type EssayFilterGroupKey = Exclude<keyof EssayLibraryFilters, "query" | "sort">;
