import type { EssayAnswerVersion } from "@/features/essays/version-types";

/**
 * 다음 버전 번호.
 *
 * 화면에서 낙관적으로 보여주기 위한 값일 뿐이다. 여러 기기에서 동시에 버전을 만들면
 * 충돌하므로 최종 번호는 반드시 서버가 정한다. API 연동 후에는 응답으로 받은 번호로 교체한다.
 */
export function getNextVersionNumber(versions: EssayAnswerVersion[]): number {
  return versions.reduce((max, version) => Math.max(max, version.versionNumber), 0) + 1;
}

/** 최신 버전이 위로 오도록 정렬한다. */
export function sortVersionsLatestFirst(versions: EssayAnswerVersion[]): EssayAnswerVersion[] {
  return [...versions].sort((first, second) => second.versionNumber - first.versionNumber);
}

export function findLatestVersion(versions: EssayAnswerVersion[]): EssayAnswerVersion | null {
  return sortVersionsLatestFirst(versions)[0] ?? null;
}

/** 잠긴 제출본은 편집할 수 없다. */
export function isEditableVersion(version: EssayAnswerVersion): boolean {
  return !version.isLocked;
}

/** 비교의 기본값은 직전 버전(왼쪽)과 최신 버전(오른쪽)이다. */
export function getDefaultComparePair(
  versions: EssayAnswerVersion[],
): { left: EssayAnswerVersion; right: EssayAnswerVersion } | null {
  const sorted = sortVersionsLatestFirst(versions);

  if (sorted.length < 2) {
    return null;
  }

  return { left: sorted[1], right: sorted[0] };
}

export type ParagraphChange = "same" | "added" | "removed";

export interface ComparedParagraph {
  text: string;
  change: ParagraphChange;
}

function toParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * 문단 단위 단순 비교.
 *
 * 상대 버전에 똑같은 문단이 있는지만 확인한다. 문자 단위 diff가 아니므로
 * 문단 안에서 한 글자만 바뀌어도 문단 전체가 변경으로 표시되고,
 * 문단 순서만 바뀐 경우에도 양쪽 모두 변경으로 표시된다.
 * 화면에서 이 한계를 그대로 안내한다.
 */
export function compareParagraphs(
  leftContent: string,
  rightContent: string,
): { left: ComparedParagraph[]; right: ComparedParagraph[] } {
  const leftParagraphs = toParagraphs(leftContent);
  const rightParagraphs = toParagraphs(rightContent);
  const leftSet = new Set(leftParagraphs);
  const rightSet = new Set(rightParagraphs);

  return {
    left: leftParagraphs.map((text) => ({
      text,
      change: rightSet.has(text) ? "same" : "removed",
    })),
    right: rightParagraphs.map((text) => ({
      text,
      change: leftSet.has(text) ? "same" : "added",
    })),
  };
}

/** 같은 태그를 두 번 연결하지 않는다. */
export function toggleTag(selected: string[], tag: string): string[] {
  return selected.includes(tag)
    ? selected.filter((item) => item !== tag)
    : [...selected, tag];
}

export function hasSameTags(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }

  const secondSet = new Set(second);
  return first.every((tag) => secondSet.has(tag));
}
