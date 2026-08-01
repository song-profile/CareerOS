import { countCharacters } from "@/features/essays/character-count";
import { getTagCatalog } from "@/features/essays/tag-catalog";
import { findVersionById, findVersionHistory } from "@/features/essays/version-mock-data";
import { getNextVersionNumber } from "@/features/essays/version-utils";
import type {
  CreateEssayVersionPayload,
  EssayAnswerVersion,
  EssayVersionComparison,
  EssayVersionResult,
  UpdateEssayTagsPayload,
} from "@/features/essays/version-types";

/**
 * 버전과 태그의 데이터 접근 지점.
 *
 * 전부 목 구현이며 실제 네트워크 호출을 하지 않는다. API 연동 시 이 파일의 함수 본문만
 * 교체하면 되고 화면 코드는 그대로 둔다. 기획서 API 명세 기준 교체 대상은 다음과 같다.
 *
 * - getEssayVersions      -> GET  /api/essay-answers/{id}/versions
 * - createEssayVersion    -> POST /api/essay-answers/{id}/versions
 * - getEssayVersion       -> GET  /api/essay-answers/{id}
 * - updateEssayTags       -> PATCH 태그 연결 (명세 미정, 백엔드 확정 필요)
 * - compareEssayVersions  -> 두 버전 조회 조합 (전용 endpoint 없음)
 *
 * 태그는 API에서 이름이 아니라 id로 오갈 가능성이 높다. 이름↔id 변환은 이 파일 안에서 흡수한다.
 * 자소서 본문은 민감 정보이므로 어떤 함수도 내용을 로그로 남기지 않는다.
 */

const MAX_CREATED_REASON_LENGTH = 100;

export async function getEssayVersions(
  answerGroupId: string,
): Promise<EssayVersionResult<EssayAnswerVersion[]>> {
  const versions = findVersionHistory(answerGroupId);

  if (!versions) {
    return { ok: false, message: "버전 목록을 찾을 수 없습니다." };
  }

  return { ok: true, value: versions };
}

export async function getEssayVersion(
  versionId: string,
): Promise<EssayVersionResult<EssayAnswerVersion>> {
  const version = findVersionById(versionId);

  if (!version) {
    return { ok: false, message: "해당 버전을 찾을 수 없습니다." };
  }

  return { ok: true, value: version };
}

/**
 * 새 버전을 만든다. 기준 버전은 절대 수정하지 않고 항상 새 버전을 덧붙인다.
 * 반환하는 버전 번호는 화면 표시용 낙관값이며, 실제 번호는 서버가 결정한다.
 */
export async function createEssayVersion(
  answerGroupId: string,
  payload: CreateEssayVersionPayload,
  currentVersions: EssayAnswerVersion[],
): Promise<EssayVersionResult<EssayAnswerVersion>> {
  const baseVersion = currentVersions.find(
    (version) => version.versionId === payload.baseVersionId,
  );

  if (!baseVersion) {
    return { ok: false, message: "기준 버전을 찾을 수 없습니다." };
  }

  if (payload.answerStatus === "개선본" && !baseVersion.isLocked) {
    return { ok: false, message: "개선본은 제출본에서만 만들 수 있습니다." };
  }

  if (payload.createdReason.length > MAX_CREATED_REASON_LENGTH) {
    return {
      ok: false,
      message: `생성 이유는 ${MAX_CREATED_REASON_LENGTH}자를 넘을 수 없습니다.`,
    };
  }

  const content = payload.copyContent ? baseVersion.content : "";
  const versionNumber = getNextVersionNumber(currentVersions);
  const now = new Date();

  return {
    ok: true,
    value: {
      versionId: `${answerGroupId}-v${versionNumber}-${now.getTime()}`,
      answerGroupId,
      questionId: baseVersion.questionId,
      versionNumber,
      answerStatus: payload.answerStatus,
      content,
      characterCount: countCharacters(content),
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      parentVersionId: baseVersion.versionId,
      createdReason: payload.createdReason.trim() || "이유 없음",
      isLocked: false,
      // 태그는 버전별 값이므로 기준 버전의 연결을 복사한 뒤 사용자가 조정한다.
      experienceTags: [...baseVersion.experienceTags],
      competencyTags: [...baseVersion.competencyTags],
    },
  };
}

export async function updateEssayTags(
  versionId: string,
  payload: UpdateEssayTagsPayload,
  currentVersions: EssayAnswerVersion[],
): Promise<EssayVersionResult<EssayAnswerVersion>> {
  const version = currentVersions.find((candidate) => candidate.versionId === versionId);

  if (!version) {
    return { ok: false, message: "버전을 찾을 수 없습니다." };
  }

  if (version.isLocked) {
    return { ok: false, message: "제출본의 태그는 변경할 수 없습니다." };
  }

  // 화면에서 이미 막고 있지만 서버가 할 검증을 같은 자리에 남겨 둔다.
  const unknownTag = [
    ...payload.experienceTags.filter((tag) => !getTagCatalog("experience").includes(tag)),
    ...payload.competencyTags.filter((tag) => !getTagCatalog("competency").includes(tag)),
  ][0];

  if (unknownTag) {
    return { ok: false, message: `등록되지 않은 태그입니다: ${unknownTag}` };
  }

  if (
    new Set(payload.experienceTags).size !== payload.experienceTags.length ||
    new Set(payload.competencyTags).size !== payload.competencyTags.length
  ) {
    return { ok: false, message: "같은 태그를 중복해서 연결할 수 없습니다." };
  }

  return {
    ok: true,
    value: {
      ...version,
      experienceTags: [...payload.experienceTags],
      competencyTags: [...payload.competencyTags],
      updatedAt: new Date(),
    },
  };
}

export async function compareEssayVersions(
  leftVersionId: string,
  rightVersionId: string,
): Promise<EssayVersionResult<EssayVersionComparison>> {
  if (leftVersionId === rightVersionId) {
    return { ok: false, message: "서로 다른 두 버전을 선택해 주세요." };
  }

  const left = findVersionById(leftVersionId);
  const right = findVersionById(rightVersionId);

  if (!left || !right) {
    return { ok: false, message: "비교할 버전을 찾을 수 없습니다." };
  }

  return { ok: true, value: { left, right } };
}
