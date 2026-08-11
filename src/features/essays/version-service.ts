import {
  addEssayAnswerTag,
  createImprovedEssayVersion,
  fetchExperienceTags,
  removeEssayAnswerTag,
} from "@/features/essays/api/essay-api";
import {
  toEssayAnswerVersion,
  withAnswerGroupId,
} from "@/features/essays/api/mapper";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  CreateEssayVersionPayload,
  EssayAnswerVersion,
  EssayVersionResult,
  UpdateEssayTagsPayload,
} from "@/features/essays/version-types";

/**
 * 버전과 태그를 바꾸는 클라이언트 쪽 진입점.
 *
 * 조회는 서버 컴포넌트가 server-essay-api의 fetchEssayVersionsForCurrentUser로 처리하므로
 * 여기에는 두지 않는다. 이 파일은 사용자의 조작으로 상태가 바뀌는 경우만 담당한다.
 *
 * - createEssayVersion -> POST /api/essay-answers/{id}/versions
 * - updateEssayTags    -> POST/DELETE 태그 연결
 *
 * 태그는 API에서 이름이 아니라 id로 오간다. 이름↔id 변환은 이 파일 안에서 흡수한다.
 * 자소서 본문은 민감 정보이므로 어떤 함수도 내용을 로그로 남기지 않는다.
 */

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
    return { ok: false, message: getApiErrorMessage(error, "새 버전을 생성") };
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
    return { ok: false, message: getApiErrorMessage(error, "태그를 변경") };
  }
}
