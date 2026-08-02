export type CommonQuestionTypeDto =
  | "MOTIVATION"
  | "GROWTH"
  | "PROBLEM_SOLVING"
  | "COLLABORATION"
  | "CHALLENGE_FAILURE"
  | "JOB_COMPETENCY"
  | "FUTURE_PLAN"
  | "ETHICS_RESPONSIBILITY"
  | "OTHER";

export type EssayAnswerStatusDto = "DRAFT" | "SUBMITTED" | "IMPROVED";

export interface ExperienceTagDto {
  id: number;
  name: string;
  description: string | null;
}

export interface EssayQuestionDto {
  id: number;
  applicationId: number;
  questionOrder: number;
  questionText: string;
  characterLimit: number | null;
  commonQuestionType: CommonQuestionTypeDto;
}

export interface EssayQuestionRequestDto {
  questionOrder: number;
  questionText: string;
  characterLimit: number | null;
  commonQuestionType: CommonQuestionTypeDto;
}

export interface EssayAnswerDto {
  id: number;
  questionId: number;
  applicationId: number;
  companyName: string;
  positionName: string;
  questionText: string;
  content: string;
  characterCount: number;
  version: number;
  status: EssayAnswerStatusDto;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  experienceTags: ExperienceTagDto[];
}

export interface EssayAnswerRequestDto {
  content: string;
}

export interface EssayQueryDto {
  company?: string;
  position?: string;
  commonType?: CommonQuestionTypeDto;
  experienceTag?: number;
  answerStatus?: EssayAnswerStatusDto;
  recruitmentYear?: number;
  keyword?: string;
}

export interface ExperienceTagRequestDto {
  name: string;
  description: string | null;
}

export interface EssayAnswerTagRequestDto {
  tagId: number;
}
