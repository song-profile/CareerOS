import type { EssayTag, EssayTagType } from "@/features/essays/version-types";

/**
 * 선택 가능한 태그 목록.
 *
 * 실제로는 사용자별 `experience_tags` 테이블에서 내려온다. 태그 생성·수정·삭제 화면은
 * 이번 단계 범위가 아니므로 목록만 제공한다.
 * API 연동 시에는 태그를 이름이 아니라 id로 주고받게 되므로, 이름과 id를 잇는 변환은
 * version-service 안에서 처리한다.
 */
export const EXPERIENCE_TAGS: string[] = [
  "LOODI",
  "기숙사 커뮤니티",
  "씨앤태크 ICT 인턴",
  "군 최우수상",
  "성적우수자",
];

export const COMPETENCY_TAGS: string[] = [
  "문제 해결",
  "안정성",
  "협업",
  "책임감",
  "사용자 관점",
  "빠른 학습",
];

export const TAG_TYPE_LABEL: Record<EssayTagType, string> = {
  experience: "경험 소재",
  competency: "역량 태그",
};

export function getTagCatalog(type: EssayTagType): string[] {
  return type === "experience" ? EXPERIENCE_TAGS : COMPETENCY_TAGS;
}

export const ALL_ESSAY_TAGS: EssayTag[] = [
  ...EXPERIENCE_TAGS.map((name): EssayTag => ({ name, type: "experience" })),
  ...COMPETENCY_TAGS.map((name): EssayTag => ({ name, type: "competency" })),
];

/** 대소문자와 앞뒤 공백을 무시하고 검색한다. */
export function searchTags(catalog: string[], query: string): string[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return catalog;
  }

  return catalog.filter((tag) => tag.toLowerCase().includes(normalized));
}
