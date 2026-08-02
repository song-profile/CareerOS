import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiModuleContract } from "@/lib/api/types";
import type {
  EssayAnswerDto,
  EssayAnswerRequestDto,
  EssayAnswerTagRequestDto,
  EssayQueryDto,
  EssayQuestionDto,
  EssayQuestionRequestDto,
  ExperienceTagDto,
  ExperienceTagRequestDto,
} from "@/features/essays/api/dto";

export async function fetchEssayAnswers(query?: EssayQueryDto): Promise<EssayAnswerDto[]> {
  return apiClient<EssayAnswerDto[]>(apiEndpoints.essays.list, { query });
}

export async function createEssayQuestion(
  applicationId: string,
  request: EssayQuestionRequestDto,
): Promise<EssayQuestionDto> {
  return apiClient<EssayQuestionDto>(apiEndpoints.applications.essayQuestions(applicationId), {
    method: "POST",
    body: request,
  });
}

export async function fetchEssayQuestions(applicationId: string): Promise<EssayQuestionDto[]> {
  return apiClient<EssayQuestionDto[]>(
    apiEndpoints.applications.essayQuestions(applicationId),
  );
}

export async function updateEssayQuestion(
  id: string,
  request: EssayQuestionRequestDto,
): Promise<EssayQuestionDto> {
  return apiClient<EssayQuestionDto>(apiEndpoints.essays.question(id), {
    method: "PATCH",
    body: request,
  });
}

export async function createEssayAnswer(
  questionId: string,
  request: EssayAnswerRequestDto,
): Promise<EssayAnswerDto> {
  return apiClient<EssayAnswerDto>(apiEndpoints.essays.createAnswer(questionId), {
    method: "POST",
    body: request,
  });
}

export async function updateEssayAnswer(
  id: string,
  request: EssayAnswerRequestDto,
): Promise<EssayAnswerDto> {
  return apiClient<EssayAnswerDto>(apiEndpoints.essays.answer(id), {
    method: "PATCH",
    body: request,
  });
}

export async function createImprovedEssayVersion(
  id: string,
  request: EssayAnswerRequestDto,
): Promise<EssayAnswerDto> {
  return apiClient<EssayAnswerDto>(apiEndpoints.essays.versions(id), {
    method: "POST",
    body: request,
  });
}

export async function submitLockEssayAnswer(
  id: string,
  request: EssayAnswerRequestDto,
): Promise<EssayAnswerDto> {
  return apiClient<EssayAnswerDto>(apiEndpoints.essays.submitLock(id), {
    method: "POST",
    body: request,
  });
}

export async function fetchEssayVersions(id: string): Promise<EssayAnswerDto[]> {
  return apiClient<EssayAnswerDto[]>(apiEndpoints.essays.versions(id));
}

export async function fetchExperienceTags(): Promise<ExperienceTagDto[]> {
  return apiClient<ExperienceTagDto[]>(apiEndpoints.essays.tags);
}

export async function createExperienceTag(
  request: ExperienceTagRequestDto,
): Promise<ExperienceTagDto> {
  return apiClient<ExperienceTagDto>(apiEndpoints.essays.tags, {
    method: "POST",
    body: request,
  });
}

export async function addEssayAnswerTag(
  id: string,
  request: EssayAnswerTagRequestDto,
): Promise<EssayAnswerDto> {
  return apiClient<EssayAnswerDto>(apiEndpoints.essays.answerTags(id), {
    method: "POST",
    body: request,
  });
}

export async function removeEssayAnswerTag(id: string, tagId: string): Promise<void> {
  await apiClient<void>(apiEndpoints.essays.answerTag(id, tagId), { method: "DELETE" });
}

export const essayApiContract: ApiModuleContract = {
  moduleName: "essayApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/essays",
    "POST /api/applications/{applicationId}/essay-questions",
    "GET /api/applications/{applicationId}/essay-questions",
    "PATCH /api/essay-questions/{id}",
    "POST /api/essay-questions/{questionId}/answers",
    "PATCH /api/essay-answers/{id}",
    "POST /api/essay-answers/{id}/versions",
    "POST /api/essay-answers/{id}/submit-lock",
    "GET /api/essay-answers/{id}/versions",
    "GET /api/experience-tags",
    "POST /api/experience-tags",
    "POST /api/essay-answers/{id}/tags",
    "DELETE /api/essay-answers/{id}/tags/{tagId}",
  ],
  notes: [
    "태그 연결은 이름이 아니라 tagId로 교환합니다.",
    "버전 번호와 characterCount는 서버 응답을 신뢰합니다.",
    "현재 EssayAnswerResponse만으로는 기존 라이브러리 ViewModel의 season/characterLimit을 완전히 만들 수 없어 화면 연결은 보류합니다.",
  ],
};
