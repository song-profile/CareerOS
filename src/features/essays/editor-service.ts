import { countCharacters, isBlank } from "@/features/essays/character-count";
import type {
  EssayDraftPayload,
  EssaySaveResult,
  SubmitLockPayload,
} from "@/features/essays/editor-types";
import {
  submitLockEssayAnswer,
  updateEssayAnswer,
  updateEssayQuestion,
} from "@/features/essays/api/essay-api";
import { toCommonQuestionTypeDto } from "@/features/essays/api/mapper";
import { ApiClientError } from "@/lib/api/client";

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

export async function saveEssayDraft(
  answerId: string,
  payload: EssayDraftPayload,
): Promise<EssaySaveResult> {
  try {
    const [answer] = await Promise.all([
      updateEssayAnswer(answerId, { content: payload.content }),
      updateEssayQuestion(payload.question.questionId, {
        questionOrder: payload.question.questionOrder,
        questionText: payload.question.questionText,
        characterLimit: payload.question.characterLimit,
        commonQuestionType: toCommonQuestionTypeDto(payload.commonQuestionType),
      }),
    ]);

    return { ok: true, savedAt: new Date(answer.updatedAt) };
  } catch (error) {
    return { ok: false, message: getEssayActionErrorMessage(error) };
  }
}

export async function lockEssaySubmission(
  answerId: string,
  payload: SubmitLockPayload,
): Promise<EssaySaveResult> {
  // 화면에서 이미 막고 있지만 서버가 할 검증을 같은 자리에 남겨 둔다.
  if (isBlank(payload.content)) {
    return { ok: false, message: "답변 내용이 비어 있어 제출본으로 저장할 수 없습니다." };
  }

  void countCharacters(payload.content);

  try {
    const answer = await submitLockEssayAnswer(answerId, { content: payload.content });
    return { ok: true, savedAt: new Date(answer.updatedAt) };
  } catch (error) {
    return { ok: false, message: getEssayActionErrorMessage(error) };
  }
}

function getEssayActionErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "자소서 요청을 처리할 수 없습니다.";
}
