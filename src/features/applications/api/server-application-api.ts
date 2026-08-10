import { ApiClientError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { serverApiRequest } from "@/lib/api/server-client";
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
    return { ok: true, value: await serverApiRequest<TValue>(path, query) };
  } catch (error) {
    return {
      ok: false,
      message: getApiErrorMessage(error, "지원 정보를 조회"),
      status: error instanceof ApiClientError ? error.status : undefined,
    };
  }
}
