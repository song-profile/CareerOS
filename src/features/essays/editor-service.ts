import { countCharacters, isBlank } from "@/features/essays/character-count";
import { findEssayAnswerDetail } from "@/features/essays/editor-mock-data";
import type {
  EssayAnswerDetail,
  EssayDraftPayload,
  EssaySaveResult,
  SubmitLockPayload,
} from "@/features/essays/editor-types";

/**
 * 자소서 에디터의 데이터 접근 지점.
 *
 * 지금은 전부 목 구현이며 실제 네트워크 호출을 하지 않는다.
 * API 연동 시에는 이 파일의 세 함수 본문만 `apiClient` 호출로 바꾸면 되고
 * 화면 코드는 수정할 필요가 없다.
 *
 * - getEssayAnswer      -> GET   /api/essay-answers/{id}
 * - saveEssayDraft      -> POST  /api/essay-answers/{id}/versions
 * - lockEssaySubmission -> POST  /api/essay-answers/{id}/submit-lock
 *
 * 자소서 본문은 민감 정보로 취급한다. 어떤 함수도 내용을 로그로 남기지 않는다.
 */

export async function getEssayAnswer(answerId: string): Promise<EssayAnswerDetail | null> {
  return findEssayAnswerDetail(answerId);
}

export async function saveEssayDraft(
  answerId: string,
  payload: EssayDraftPayload,
): Promise<EssaySaveResult> {
  const answer = findEssayAnswerDetail(answerId);

  if (!answer) {
    return { ok: false, message: "답변을 찾을 수 없습니다. 목록에서 다시 열어 주세요." };
  }

  // 제출본은 서버에서도 수정을 막는다. 화면 상태만 믿지 않는다.
  if (answer.answerStatus === "제출본") {
    return { ok: false, message: "제출본은 수정할 수 없습니다. 개선본을 만들어 주세요." };
  }

  // 작성본은 비어 있거나 제한을 넘어도 임시 저장을 허용한다.
  void payload;

  return { ok: true, savedAt: new Date() };
}

export async function lockEssaySubmission(
  answerId: string,
  payload: SubmitLockPayload,
): Promise<EssaySaveResult> {
  const answer = findEssayAnswerDetail(answerId);

  if (!answer) {
    return { ok: false, message: "답변을 찾을 수 없습니다. 목록에서 다시 열어 주세요." };
  }

  if (answer.answerStatus === "제출본") {
    return { ok: false, message: "이미 제출본으로 저장된 답변입니다." };
  }

  // 화면에서 이미 막고 있지만 서버가 할 검증을 같은 자리에 남겨 둔다.
  if (isBlank(payload.content)) {
    return { ok: false, message: "답변 내용이 비어 있어 제출본으로 저장할 수 없습니다." };
  }

  const limit = answer.question.characterLimit;

  if (limit !== null && countCharacters(payload.content) > limit) {
    return { ok: false, message: "제한 글자 수를 초과해 제출본으로 저장할 수 없습니다." };
  }

  return { ok: true, savedAt: new Date() };
}
