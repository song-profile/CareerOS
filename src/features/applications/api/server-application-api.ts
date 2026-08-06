import { createServerCookieHeader } from "@/lib/api/server-cookie";
import { ApiClientError, createApiUrl } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiQueryParams } from "@/lib/api/types";
import type { ApplicationDetail } from "@/features/applications/detail-types";
import type { ApplicationListItem } from "@/features/applications/types";
import type { ApplicationDto, ApplicationQueryDto } from "@/features/applications/api/dto";
import {
  toApplicationDetail,
  toApplicationListItem,
} from "@/features/applications/api/mapper";

export type ApplicationApiResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function fetchApplicationsForCurrentUser(
  query?: ApplicationQueryDto,
): Promise<ApplicationApiResult<ApplicationListItem[]>> {
  const result = await serverApplicationRequest<ApplicationDto[]>(
    apiEndpoints.applications.list,
    query,
  );

  if (!result.ok) {
    return result;
  }

  return { ok: true, value: result.value.map(toApplicationListItem) };
}

export async function fetchApplicationForCurrentUser(
  id: string,
): Promise<ApplicationApiResult<ApplicationDetail>> {
  const result = await serverApplicationRequest<ApplicationDto>(
    apiEndpoints.applications.detail(id),
  );

  if (!result.ok) {
    return result;
  }

  return { ok: true, value: toApplicationDetail(result.value) };
}

async function serverApplicationRequest<TValue>(
  path: string,
  query?: ApiQueryParams,
): Promise<ApplicationApiResult<TValue>> {
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
          ? "지원 건을 찾을 수 없습니다."
          : "지원 정보를 불러올 수 없습니다.",
        status: response.status,
      };
    }

    return { ok: true, value: (await response.json()) as TValue };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, message: error.message, status: error.status };
    }

    return { ok: false, message: "지원 API에 연결할 수 없습니다." };
  }
}
