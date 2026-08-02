import { cookies } from "next/headers";
import { createApiUrl } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiQueryParams } from "@/lib/api/types";
import { fetchApplicationForCurrentUser } from "@/features/applications/api/server-application-api";
import type { ApplicationDetail } from "@/features/applications/detail-types";
import type { EssayAnswerDetail } from "@/features/essays/editor-types";
import type { EssayLibraryItem } from "@/features/essays/types";
import type { EssayAnswerVersion } from "@/features/essays/version-types";
import type {
  EssayAnswerDto,
  EssayQueryDto,
  EssayQuestionDto,
  ExperienceTagDto,
} from "@/features/essays/api/dto";
import {
  toEssayAnswerDetail,
  toEssayAnswerVersion,
  toEssayLibraryItem,
  withAnswerGroupId,
} from "@/features/essays/api/mapper";

export type EssayApiResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function fetchEssayLibraryForCurrentUser(
  query?: EssayQueryDto,
): Promise<EssayApiResult<EssayLibraryItem[]>> {
  const answersResult = await serverEssayRequest<EssayAnswerDto[]>(
    apiEndpoints.essays.list,
    query,
  );

  if (!answersResult.ok) {
    return answersResult;
  }

  const context = await buildEssayContext(answersResult.value);
  const items = answersResult.value
    .map((answer) => {
      const application = context.applications.get(answer.applicationId);

      if (!application) {
        return null;
      }

      return toEssayLibraryItem(
        answer,
        application,
        context.questions.get(answer.applicationId)?.get(answer.questionId),
      );
    })
    .filter((item): item is EssayLibraryItem => item !== null);

  return { ok: true, value: items };
}

export async function fetchEssayAnswerForCurrentUser(
  answerId: string,
): Promise<EssayApiResult<EssayAnswerDetail>> {
  const versionsResult = await fetchEssayVersionDtos(answerId);

  if (!versionsResult.ok) {
    return versionsResult;
  }

  const answer = versionsResult.value.find((item) => String(item.id) === answerId);

  if (!answer) {
    return { ok: false, message: "답변을 찾을 수 없습니다.", status: 404 };
  }

  const context = await buildEssayContext([answer]);
  const application = context.applications.get(answer.applicationId);

  if (!application) {
    return { ok: false, message: "지원 건 정보를 불러올 수 없습니다." };
  }

  return {
    ok: true,
    value: toEssayAnswerDetail(
      answer,
      application,
      context.questions.get(answer.applicationId)?.get(answer.questionId),
    ),
  };
}

export async function fetchEssayVersionsForCurrentUser(
  answerId: string,
): Promise<EssayApiResult<EssayAnswerVersion[]>> {
  const result = await fetchEssayVersionDtos(answerId);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    value: result.value.map((dto) => withAnswerGroupId(toEssayAnswerVersion(dto), answerId)),
  };
}

export async function fetchExperienceTagsForCurrentUser(): Promise<
  EssayApiResult<ExperienceTagDto[]>
> {
  return serverEssayRequest<ExperienceTagDto[]>(apiEndpoints.essays.tags);
}

async function fetchEssayVersionDtos(answerId: string): Promise<EssayApiResult<EssayAnswerDto[]>> {
  return serverEssayRequest<EssayAnswerDto[]>(apiEndpoints.essays.versions(answerId));
}

async function buildEssayContext(answers: EssayAnswerDto[]) {
  const applicationIds = [...new Set(answers.map((answer) => answer.applicationId))];
  const applications = new Map<number, ApplicationDetail>();
  const questions = new Map<number, Map<number, EssayQuestionDto>>();

  await Promise.all(
    applicationIds.map(async (applicationId) => {
      const [applicationResult, questionsResult] = await Promise.all([
        fetchApplicationForCurrentUser(String(applicationId)),
        serverEssayRequest<EssayQuestionDto[]>(
          apiEndpoints.applications.essayQuestions(applicationId),
        ),
      ]);

      if (applicationResult.ok) {
        applications.set(applicationId, applicationResult.value);
      }

      if (questionsResult.ok) {
        questions.set(
          applicationId,
          new Map(questionsResult.value.map((question) => [question.id, question])),
        );
      }
    }),
  );

  return { applications, questions };
}

async function serverEssayRequest<TValue>(
  path: string,
  query?: ApiQueryParams,
): Promise<EssayApiResult<TValue>> {
  try {
    const response = await fetch(createApiUrl(path, query), {
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: await createServerCookieHeader(),
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: response.status === 404
          ? "자소서 정보를 찾을 수 없습니다."
          : "자소서 정보를 불러올 수 없습니다.",
        status: response.status,
      };
    }

    return { ok: true, value: (await response.json()) as TValue };
  } catch {
    return { ok: false, message: "자소서 API에 연결할 수 없습니다." };
  }
}

async function createServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
