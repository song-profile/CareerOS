import type { BadgeProps } from "@/components/ui/badge";
import type {
  CommonQuestionType,
  EssayAnswerStatus,
  EssaySortOption,
} from "@/features/essays/types";

export const COMMON_QUESTION_TYPES: CommonQuestionType[] = [
  "지원동기",
  "성장과정",
  "문제해결",
  "협업갈등",
  "도전실패",
  "직무역량",
  "입사포부",
  "윤리책임",
  "기타",
];

/** 내부 값과 표시용 라벨이 다르므로 매핑한다. */
export const COMMON_QUESTION_TYPE_LABEL: Record<CommonQuestionType, string> = {
  지원동기: "지원동기",
  성장과정: "성장과정",
  문제해결: "문제 해결",
  협업갈등: "협업·갈등",
  도전실패: "도전·실패",
  직무역량: "직무역량",
  입사포부: "입사 후 포부",
  윤리책임: "윤리·책임",
  기타: "기타",
};

export const ESSAY_ANSWER_STATUSES: EssayAnswerStatus[] = ["작성본", "제출본", "개선본"];

export const ESSAY_ANSWER_STATUS_VARIANT: Record<EssayAnswerStatus, BadgeProps["variant"]> = {
  작성본: "statusDraft",
  제출본: "statusSubmitted",
  개선본: "primary",
};

/** 색만으로 상태를 전달하지 않도록 배지 옆에 함께 노출하는 설명. */
export const ESSAY_ANSWER_STATUS_DESCRIPTION: Record<EssayAnswerStatus, string> = {
  작성본: "수정 가능",
  제출본: "잠김 · 수정 불가",
  개선본: "제출 후 보완",
};

export const ESSAY_SORT_OPTIONS: { label: string; value: EssaySortOption }[] = [
  { label: "최근 수정순", value: "updatedDesc" },
  { label: "오래된 수정순", value: "updatedAsc" },
  { label: "회사명순", value: "companyAsc" },
  { label: "글자 수 많은 순", value: "characterCountDesc" },
  { label: "제출일 최신순", value: "submittedDesc" },
];

export const DEFAULT_ESSAY_SORT: EssaySortOption = "updatedDesc";

export const ESSAY_FILTER_GROUP_LABEL = {
  companies: "회사",
  positions: "직무",
  questionTypes: "공통 질문 유형",
  experienceTags: "경험 소재",
  statuses: "답변 상태",
  years: "지원연도",
} as const;
