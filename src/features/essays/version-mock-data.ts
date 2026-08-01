import { addDays } from "@/features/applications/date-utils";
import { countCharacters } from "@/features/essays/character-count";
import { ESSAY_ANSWER_CONTENT, essayLibraryMockData } from "@/features/essays/mock-data";
import type { EssayLibraryItem } from "@/features/essays/types";
import type { EssayAnswerVersion, EssayVersionStatus } from "@/features/essays/version-types";

function toParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** 이전 버전일수록 문단이 적었다고 본다. 마지막 버전은 항상 전문이다. */
function buildVersionContent(fullContent: string, versionNumber: number, total: number): string {
  if (versionNumber >= total) {
    return fullContent;
  }

  const paragraphs = toParagraphs(fullContent);
  const take = Math.max(1, Math.ceil((paragraphs.length * versionNumber) / total));

  return paragraphs.slice(0, take).join("\n\n");
}

/**
 * 마지막 버전의 상태에서 거슬러 올라가 각 버전의 상태를 정한다.
 * 개선본이 있으면 그 앞에는 반드시 제출본이 있다.
 */
function buildVersionStatuses(total: number, latestStatus: EssayVersionStatus): EssayVersionStatus[] {
  const statuses: EssayVersionStatus[] = Array.from({ length: total }, () => "작성본");
  statuses[total - 1] = latestStatus;

  if (latestStatus === "개선본" && total >= 2) {
    statuses[total - 2] = "제출본";
  }

  return statuses;
}

function buildCreatedReason(status: EssayVersionStatus, versionNumber: number): string {
  if (versionNumber === 1) {
    return "첫 작성";
  }

  if (status === "제출본") {
    return "지원 마감 전 제출";
  }

  if (status === "개선본") {
    return "제출 후 내용 보완";
  }

  return "내용 보완";
}

/** 버전별로 태그가 달라지는 시나리오를 직접 지정한다. 나머지는 목록 데이터의 태그를 쓴다. */
const VERSION_TAG_OVERRIDES: Record<string, { experienceTags: string[]; competencyTags: string[] }> = {
  "answer-kb-1-v1": { experienceTags: ["LOODI"], competencyTags: [] },
  "answer-kb-1-v2": { experienceTags: ["LOODI", "씨앤태크 ICT 인턴"], competencyTags: [] },
  "answer-kb-1-v3": { experienceTags: ["LOODI"], competencyTags: ["문제 해결", "안정성"] },
};

function buildVersionHistory(item: EssayLibraryItem): EssayAnswerVersion[] {
  const fullContent = ESSAY_ANSWER_CONTENT[item.answerId] ?? "";
  const total = Math.max(1, item.version);
  const statuses = buildVersionStatuses(total, item.answerStatus);

  return Array.from({ length: total }, (_, index) => {
    const versionNumber = index + 1;
    const versionId = `${item.answerId}-v${versionNumber}`;
    const status = statuses[index];
    const content = buildVersionContent(fullContent, versionNumber, total);
    // 최신 버전이 목록의 updatedAt이고, 이전 버전일수록 과거로 보낸다.
    const createdAt = addDays(item.updatedAt, -(total - versionNumber) * 4);
    const tags = VERSION_TAG_OVERRIDES[versionId] ?? {
      experienceTags: item.experienceTags,
      competencyTags: item.competencyTags,
    };

    return {
      versionId,
      answerGroupId: item.answerId,
      questionId: item.questionId,
      versionNumber,
      answerStatus: status,
      content,
      characterCount: countCharacters(content),
      createdAt,
      updatedAt: versionNumber === total ? item.updatedAt : createdAt,
      submittedAt: status === "제출본" ? (item.submittedAt ?? createdAt) : null,
      parentVersionId: versionNumber === 1 ? null : `${item.answerId}-v${versionNumber - 1}`,
      createdReason: buildCreatedReason(status, versionNumber),
      isLocked: status === "제출본",
      experienceTags: tags.experienceTags,
      competencyTags: tags.competencyTags,
    };
  });
}

/**
 * 목 데이터는 순수하게 계산한다.
 * 모듈 스코프에 가변 저장소를 두면 서버에서 요청 사이에 공유되어 실제 API 전환 시 문제가 되므로,
 * 새로 만든 버전은 화면(클라이언트 상태)에서만 유지한다.
 */
export function findVersionHistory(answerGroupId: string): EssayAnswerVersion[] | null {
  const item = essayLibraryMockData.find((candidate) => candidate.answerId === answerGroupId);

  return item ? buildVersionHistory(item) : null;
}

export function findVersionById(versionId: string): EssayAnswerVersion | null {
  for (const item of essayLibraryMockData) {
    const found = buildVersionHistory(item).find((version) => version.versionId === versionId);

    if (found) {
      return found;
    }
  }

  return null;
}
