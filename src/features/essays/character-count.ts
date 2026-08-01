/**
 * 글자 수 계산 규칙.
 *
 * - 공백 포함으로 계산한다. (기획 문서와 API 명세에 별도 규칙이 없어 국내 채용 사이트 관행을 따랐다.)
 * - 줄바꿈은 1자로 센다. textarea 값은 브라우저가 `\n`으로 정규화하므로 CRLF는 고려하지 않는다.
 * - 백엔드가 Java이므로 UTF-16 기준 `String.length()`와 같은 값이 나오도록 `text.length`를 쓴다.
 *   (이모지 같은 서로게이트 쌍은 2자로 계산된다. 백엔드 규칙이 확정되면 이 함수만 바꾸면 된다.)
 */
export function countCharacters(text: string): number {
  return text.length;
}

export type CharacterCountLevel = "normal" | "warning" | "over";

const WARNING_RATIO = 0.8;

/** 제한이 없는 문항(characterLimit === null)은 항상 normal이다. */
export function getCharacterCountLevel(count: number, limit: number | null): CharacterCountLevel {
  if (limit === null) {
    return "normal";
  }

  if (count > limit) {
    return "over";
  }

  return count >= limit * WARNING_RATIO ? "warning" : "normal";
}

export function getOverflowCount(count: number, limit: number | null): number {
  if (limit === null) {
    return 0;
  }

  return Math.max(0, count - limit);
}

/** 공백만 있는 답변은 내용이 없는 것으로 본다. */
export function isBlank(text: string): boolean {
  return text.trim().length === 0;
}
