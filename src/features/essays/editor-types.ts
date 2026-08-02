import type { RecruitmentSeason } from "@/features/applications/types";
import type {
  CommonQuestionType,
  CompetencyTag,
  EssayAnswerStatus,
  ExperienceTag,
} from "@/features/essays/types";

export interface EssayQuestionDetail {
  questionId: string;
  applicationId: string;
  companyName: string;
  positionName: string;
  recruitmentYear: number;
  season: RecruitmentSeason;
  questionOrder: number;
  questionText: string;
  /** 제한 글자 수가 없는 문항은 null이다. */
  characterLimit: number | null;
  commonQuestionType: CommonQuestionType;
}

export interface EssayAnswerDetail {
  answerId: string;
  question: EssayQuestionDetail;
  content: string;
  answerStatus: EssayAnswerStatus;
  version: number;
  experienceTags: ExperienceTag[];
  competencyTags: CompetencyTag[];
  submittedAt: Date | null;
  updatedAt: Date;
  /** 개선본이 어떤 제출본에서 파생되었는지. 버전 목록은 11단계에서 구현한다. */
  derivedFromVersion: number | null;
}

export type EssaySaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export interface EssayDraftPayload {
  content: string;
  commonQuestionType: CommonQuestionType;
  question: EssayQuestionDetail;
}

export interface SubmitLockPayload {
  content: string;
  characterCount: number;
}

export type EssaySaveResult =
  | { ok: true; savedAt: Date }
  | { ok: false; message: string };
