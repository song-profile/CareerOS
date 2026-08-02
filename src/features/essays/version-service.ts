import {
  addEssayAnswerTag,
  createImprovedEssayVersion,
  fetchEssayVersions,
  fetchExperienceTags,
  removeEssayAnswerTag,
} from "@/features/essays/api/essay-api";
import {
  toEssayAnswerVersion,
  withAnswerGroupId,
} from "@/features/essays/api/mapper";
import { ApiClientError } from "@/lib/api/client";
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

export async function getEssayVersions(
  answerGroupId: string,
): Promise<EssayVersionResult<EssayAnswerVersion[]>> {
  try {
    const versions = await fetchEssayVersions(answerGroupId);
    return {
      ok: true,
      value: versions.map((version) => withAnswerGroupId(toEssayAnswerVersion(version), answerGroupId)),
    };
  } catch (error) {
    return { ok: false, message: getVersionActionErrorMessage(error) };
  }
}

export async function getEssayVersion(
  versionId: string,
): Promise<EssayVersionResult<EssayAnswerVersion>> {
  const versions = await getEssayVersions(versionId);

  if (!versions.ok) {
    return versions;
  }

  const version = versions.value.find((candidate) => candidate.versionId === versionId);
  return version
    ? { ok: true, value: version }
    : { ok: false, message: "해당 버전을 찾을 수 없습니다." };
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

  try {
    const created = await createImprovedEssayVersion(baseVersion.versionId, {
      content: payload.copyContent ? baseVersion.content : "",
    });

    return {
      ok: true,
      value: withAnswerGroupId(toEssayAnswerVersion(created), answerGroupId),
    };
  } catch (error) {
    return { ok: false, message: getVersionActionErrorMessage(error) };
  }
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

  if (payload.competencyTags.length > 0) {
    return { ok: false, message: "역량 태그 API는 아직 제공되지 않습니다." };
  }

  if (new Set(payload.experienceTags).size !== payload.experienceTags.length) {
    return { ok: false, message: "같은 태그를 중복해서 연결할 수 없습니다." };
  }

  try {
    const tags = await fetchExperienceTags();
    const tagIdByName = new Map(tags.map((tag) => [tag.name, tag.id]));
    const current = new Set(version.experienceTags);
    const next = new Set(payload.experienceTags);

    for (const tag of current) {
      if (!next.has(tag)) {
        const tagId = tagIdByName.get(tag);
        if (tagId !== undefined) {
          await removeEssayAnswerTag(version.versionId, String(tagId));
        }
      }
    }

    let updated = version;

    for (const tag of next) {
      if (!current.has(tag)) {
        const tagId = tagIdByName.get(tag);
        if (tagId === undefined) {
          return { ok: false, message: `등록되지 않은 태그입니다: ${tag}` };
        }
        const dto = await addEssayAnswerTag(version.versionId, { tagId });
        updated = withAnswerGroupId(toEssayAnswerVersion(dto), version.answerGroupId);
      }
    }

    return {
      ok: true,
      value: {
        ...updated,
        experienceTags: [...payload.experienceTags],
        competencyTags: [],
        updatedAt: new Date(),
      },
    };
  } catch (error) {
    return { ok: false, message: getVersionActionErrorMessage(error) };
  }
}

export async function compareEssayVersions(
  leftVersionId: string,
  rightVersionId: string,
): Promise<EssayVersionResult<EssayVersionComparison>> {
  if (leftVersionId === rightVersionId) {
    return { ok: false, message: "서로 다른 두 버전을 선택해 주세요." };
  }

  const versions = await getEssayVersions(leftVersionId);

  if (!versions.ok) {
    return versions;
  }

  const left = versions.value.find((version) => version.versionId === leftVersionId);
  const right = versions.value.find((version) => version.versionId === rightVersionId);

  return left && right
    ? { ok: true, value: { left, right } }
    : { ok: false, message: "비교할 버전을 찾을 수 없습니다." };
}

function getVersionActionErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "버전 요청을 처리할 수 없습니다.";
}
