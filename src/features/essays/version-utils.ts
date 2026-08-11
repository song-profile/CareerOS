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

/**
 * 두 문단이 얼마나 겹치는지 0~1로 재는 값.
 *
 * 문단을 고쳐 쓰면 앞뒤는 그대로 두고 가운데만 바뀌는 경우가 대부분이라, 공통 앞부분과
 * 공통 뒷부분의 길이 비율만 본다. 편집 거리보다 훨씬 싸고(선형) 긴 자소서에서도 부담이 없다.
 * 대신 문단 중간만 같고 앞뒤가 다른 경우는 낮게 나온다 — 그때는 수정이 아니라
 * 삭제+추가로 따로 보여주므로 틀린 정보를 주지는 않는다.
 */
function getOverlapRatio(before: string, after: string): number {
  if (before === after) {
    return 1;
  }

  const longest = Math.max(before.length, after.length);

  if (longest === 0) {
    return 1;
  }

  const shortest = Math.min(before.length, after.length);

  let prefix = 0;
  while (prefix < shortest && before[prefix] === after[prefix]) {
    prefix++;
  }

  // 앞부분으로 이미 센 글자를 뒷부분에서 또 세지 않도록 남은 길이까지만 본다.
  let suffix = 0;
  while (
    suffix < shortest - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }

  return (prefix + suffix) / longest;
}

/** 이 정도는 겹쳐야 "같은 문단을 고쳐 썼다"고 본다. */
const CHANGED_PAIR_MIN_OVERLAP = 0.4;

/**
 * 연달아 나오는 삭제+추가 묶음에서 실제로 닮은 것끼리만 "changed"(수정)로 합친다.
 *
 * 삭제된 문단마다 아직 짝이 없는 추가 문단 중 가장 많이 겹치는 것을 고르고, 그 정도가
 * 기준에 못 미치면 짝짓지 않고 삭제와 추가로 따로 남긴다. 순서대로만 짝지으면 서로 무관한
 * 문단이 수정으로 묶여 오히려 읽기 어려워진다. 한 묶음의 크기는 보통 몇 개라 O(n²)이어도
 * 문제되지 않는다.
 */
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

    const pairedInserts = new Set<number>();

    for (const before of deletes) {
      let bestIndex = -1;
      let bestOverlap = CHANGED_PAIR_MIN_OVERLAP;

      for (let k = 0; k < inserts.length; k++) {
        if (pairedInserts.has(k)) {
          continue;
        }

        const overlap = getOverlapRatio(before, inserts[k]);

        if (overlap >= bestOverlap) {
          bestOverlap = overlap;
          bestIndex = k;
        }
      }

      if (bestIndex === -1) {
        blocks.push({ change: "removed", text: before });
        continue;
      }

      pairedInserts.add(bestIndex);
      blocks.push({ change: "changed", text: before, nextText: inserts[bestIndex] });
    }

    inserts.forEach((after, index) => {
      if (!pairedInserts.has(index)) {
        blocks.push({ change: "added", text: after });
      }
    });
  }

  return blocks;
}

/**
 * 문단 단위 diff.
 *
 * 문자 단위가 아니라 문단(빈 줄로 구분) 단위로 비교하므로, 문단 안에서 한 글자만 바뀌어도
 * 그 문단 전체가 changed로 표시된다. 문단 안 어디가 바뀌었는지까지는 알려주지 않는다.
 * 모바일 Inline Diff와 데스크톱 좌우 비교가 이 함수 하나를 공유한다.
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
