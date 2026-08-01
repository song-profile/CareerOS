import { ESSAY_ANSWER_CONTENT, essayLibraryMockData } from "@/features/essays/mock-data";
import type { EssayAnswerDetail } from "@/features/essays/editor-types";

/** 같은 지원 건 안에서의 순서를 목록 데이터에서 파생한다. */
function getQuestionOrder(applicationId: string, answerId: string): number {
  const sameApplication = essayLibraryMockData.filter(
    (item) => item.applicationId === applicationId,
  );

  return sameApplication.findIndex((item) => item.answerId === answerId) + 1;
}

export function findEssayAnswerDetail(answerId: string): EssayAnswerDetail | null {
  const item = essayLibraryMockData.find((candidate) => candidate.answerId === answerId);

  if (!item) {
    return null;
  }

  return {
    answerId: item.answerId,
    question: {
      questionId: item.questionId,
      applicationId: item.applicationId,
      companyName: item.companyName,
      positionName: item.positionName,
      recruitmentYear: item.recruitmentYear,
      season: item.season,
      questionOrder: getQuestionOrder(item.applicationId, item.answerId),
      questionText: item.questionText,
      characterLimit: item.characterLimit,
      commonQuestionType: item.commonQuestionType,
    },
    content: ESSAY_ANSWER_CONTENT[item.answerId] ?? "",
    answerStatus: item.answerStatus,
    version: item.version,
    experienceTags: item.experienceTags,
    competencyTags: item.competencyTags,
    submittedAt: item.submittedAt,
    updatedAt: item.updatedAt,
    // 개선본은 직전 제출본에서 파생된 것으로 본다. 실제 버전 관계는 11단계에서 다룬다.
    derivedFromVersion: item.answerStatus === "개선본" ? item.version - 1 : null,
  };
}
