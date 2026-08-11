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

/**
 * 가장 최근 제출본과 현재(최신) 버전의 비교 쌍.
 *
 * 제출본이 없거나, 제출 이후 새 버전을 만들지 않아 제출본 자체가 최신이면
 * 비교할 대상이 없으므로 null이다.
 */
export function getSubmittedComparePair(
  versions: EssayAnswerVersion[],
): { left: EssayAnswerVersion; right: EssayAnswerVersion } | null {
  const latestSubmitted = sortVersionsLatestFirst(
    versions.filter((version) => version.answerStatus === "제출본"),
  )[0];
  const latest = findLatestVersion(versions);

  if (!latestSubmitted || !latest || latestSubmitted.versionId === latest.versionId) {
    return null;
  }

  return { left: latestSubmitted, right: latest };
}

/**
 * URL 쿼리로 받은 버전 id를 검증해 후보 목록에서 찾는다.
 *
 * candidates는 항상 현재 사용자 소유 버전 목록이므로, 다른 사용자의 버전 id가 들어와도
 * 여기서 찾지 못해 fallback으로 빠진다 — 존재 여부조차 알려주지 않는다.
 */
export function resolveVersionOrDefault(
  candidates: EssayAnswerVersion[],
  versionId: string | undefined,
  fallback: EssayAnswerVersion,
): EssayAnswerVersion {
  return candidates.find((version) => version.versionId === versionId) ?? fallback;
}

export type ParagraphChange = "same" | "added" | "removed" | "changed";

export interface ComparedParagraph {
  text: string;
  change: ParagraphChange;
}

export interface ParagraphDiffBlock {
  change: ParagraphChange;
  /** same/added/removed는 해당 텍스트, changed는 이전(왼쪽) 버전 텍스트다. */
  text: string;
  /** changed일 때만 있는 새(오른쪽) 버전 텍스트. */
  nextText?: string;
}

function toParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

type ParagraphOp =
  | { type: "equal"; text: string }
  | { type: "delete"; text: string }
  | { type: "insert"; text: string };

/** 문단 배열 사이의 최장 공통 부분수열(LCS)로 유지/삭제/추가 순서를 정렬한다. */
function alignParagraphs(left: string[], right: string[]): ParagraphOp[] {
  const n = left.length;
  const m = right.length;
  const lcsLength: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcsLength[i][j] =
        left[i] === right[j]
          ? lcsLength[i + 1][j + 1] + 1
          : Math.max(lcsLength[i + 1][j], lcsLength[i][j + 1]);
    }
  }

  const ops: ParagraphOp[] = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (left[i] === right[j]) {
      ops.push({ type: "equal", text: left[i] });
      i++;
      j++;
    } else if (lcsLength[i + 1][j] >= lcsLength[i][j + 1]) {
      ops.push({ type: "delete", text: left[i] });
      i++;
    } else {
      ops.push({ type: "insert", text: right[j] });
      j++;
    }
  }

  while (i < n) {
    ops.push({ type: "delete", text: left[i] });
    i++;
  }

  while (j < m) {
    ops.push({ type: "insert", text: right[j] });
    j++;
  }

  return ops;
}

/** 연달아 나오는 삭제+추가 묶음은 등장 순서대로 짝지어 "changed"(수정)로 합친다. */
function pairAdjacentChanges(ops: ParagraphOp[]): ParagraphDiffBlock[] {
  const blocks: ParagraphDiffBlock[] = [];
  let i = 0;

  while (i < ops.length) {
    const op = ops[i];

    if (op.type === "equal") {
      blocks.push({ change: "same", text: op.text });
      i++;
      continue;
    }

    const deletes: string[] = [];
    const inserts: string[] = [];

    while (i < ops.length && ops[i].type !== "equal") {
      const current = ops[i];
      if (current.type === "delete") {
        deletes.push(current.text);
      } else if (current.type === "insert") {
        inserts.push(current.text);
      }
      i++;
    }

    const pairCount = Math.min(deletes.length, inserts.length);

    for (let k = 0; k < pairCount; k++) {
      blocks.push({ change: "changed", text: deletes[k], nextText: inserts[k] });
    }
    for (let k = pairCount; k < deletes.length; k++) {
      blocks.push({ change: "removed", text: deletes[k] });
    }
    for (let k = pairCount; k < inserts.length; k++) {
      blocks.push({ change: "added", text: inserts[k] });
    }
  }

  return blocks;
}

/**
 * 문단 단위 diff.
 *
 * 문자 단위가 아니라 문단(빈 줄로 구분) 단위로 비교한다. 문단 안에서 한 글자만 바뀌어도
 * 그 문단 전체가 changed로 표시되고, 문단 순서만 바뀐 경우에도 changed/added/removed로
 * 나타날 수 있다. 모바일 Inline Diff와 데스크톱 좌우 비교가 이 함수 하나를 공유한다.
 */
export function diffEssayParagraphs(
  leftContent: string,
  rightContent: string,
): ParagraphDiffBlock[] {
  const ops = alignParagraphs(toParagraphs(leftContent), toParagraphs(rightContent));
  return pairAdjacentChanges(ops);
}

/** 좌우 두 열로 나란히 보여주기 위해 diff 결과를 각 버전 쪽 문단 목록으로 나눈다. */
export function compareParagraphs(
  leftContent: string,
  rightContent: string,
): { left: ComparedParagraph[]; right: ComparedParagraph[] } {
  const left: ComparedParagraph[] = [];
  const right: ComparedParagraph[] = [];

  for (const block of diffEssayParagraphs(leftContent, rightContent)) {
    if (block.change === "same") {
      left.push({ text: block.text, change: "same" });
      right.push({ text: block.text, change: "same" });
    } else if (block.change === "removed") {
      left.push({ text: block.text, change: "removed" });
    } else if (block.change === "added") {
      right.push({ text: block.text, change: "added" });
    } else {
      left.push({ text: block.text, change: "changed" });
      right.push({ text: block.nextText ?? "", change: "changed" });
    }
  }

  return { left, right };
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
