import type { EssayAnswerStatus } from "@/features/essays/types";

export type EssayVersionStatus = EssayAnswerStatus;

export type EssayTagType = "experience" | "competency";

export interface EssayTag {
  name: string;
  type: EssayTagType;
}

/**
 * 답변 버전 한 건.
 *
 * 기획서 데이터 모델에서 `essay_answers`가 `version` 컬럼을 가지므로 이 행 자체가 버전이고,
 * `essay_answer_tags(essay_answer_id, ...)`가 이 행을 참조하므로 태그는 버전별로 보존된다.
 * 반면 `common_question_type`은 `essay_questions`에 있으므로 버전이 아니라 문항이 소유한다.
 * 그래서 이 타입에는 태그만 있고 공통 질문 유형은 없다.
 */
export interface EssayAnswerVersion {
  versionId: string;
  /** 같은 문항에 대한 버전들을 묶는 키. 현재 목 구현에서는 answerId와 같다. */
  answerGroupId: string;
  questionId: string;
  versionNumber: number;
  answerStatus: EssayVersionStatus;
  content: string;
  characterCount: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  parentVersionId: string | null;
  createdReason: string;
  isLocked: boolean;
  experienceTags: string[];
  competencyTags: string[];
}

/** 제출본은 잠기므로 새로 만들 수 있는 상태는 작성본과 개선본뿐이다. */
export type CreatableVersionStatus = Extract<EssayVersionStatus, "작성본" | "개선본">;

export interface CreateEssayVersionPayload {
  baseVersionId: string;
  answerStatus: CreatableVersionStatus;
  createdReason: string;
  copyContent: boolean;
}

export interface EssayVersionComparison {
  left: EssayAnswerVersion;
  right: EssayAnswerVersion;
}

export interface EssayTagSelection {
  experienceTags: string[];
  competencyTags: string[];
}

export type UpdateEssayTagsPayload = EssayTagSelection;

export type EssayVersionResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string };
