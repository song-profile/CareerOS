import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type { ApplicationSavePayload } from "@/features/applications/form-types";
import type { ApplicationListItem } from "@/features/applications/types";
import type { ApplicationDetail } from "@/features/applications/detail-types";
import type {
  ApplicationDto,
  ApplicationResourcesDto,
  LinkCredentialRequestDto,
  LinkExternalLinkRequestDto,
  LinkFileRequestDto,
  ApplicationQueryDto,
  ApplicationStatusDto,
  ApplicationStatusUpdateRequestDto,
} from "@/features/applications/api/dto";
import {
  mergeApplicationResources,
  toApplicationCreateRequest,
  toApplicationDetail,
  toApplicationListItem,
  toApplicationStatusDto,
  toApplicationUpdateRequest,
} from "@/features/applications/api/mapper";

export const applicationApi = {
  endpoints: {
    list: defineEndpoint<ApplicationQueryDto | undefined, ApplicationDto[], ApplicationListItem[]>({
      method: "GET",
      path: apiEndpoints.applications.list,
      response: (dtos) => dtos.map(toApplicationListItem),
    }),
    create: defineEndpoint<ApplicationSavePayload, ApplicationDto, ApplicationDetail>({
      method: "POST",
      path: apiEndpoints.applications.list,
      request: toApplicationCreateRequest,
      response: toApplicationDetail,
    }),
    detail: defineEndpoint<void, ApplicationDto, ApplicationDetail>({
      method: "GET",
      path: apiEndpoints.applications.detail,
      response: toApplicationDetail,
    }),
    update: defineEndpoint<ApplicationSavePayload, ApplicationDto, ApplicationDetail>({
      method: "PATCH",
      path: apiEndpoints.applications.detail,
      request: toApplicationUpdateRequest,
      response: toApplicationDetail,
    }),
    status: defineEndpoint<ApplicationStatusUpdateRequestDto, ApplicationDto, ApplicationDetail>({
      method: "PATCH",
      path: apiEndpoints.applications.status,
      response: toApplicationDetail,
    }),
    delete: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.applications.detail,
    }),
    resources: defineEndpoint<void, ApplicationResourcesDto>({
      method: "GET",
      path: apiEndpoints.applications.resources,
    }),
    linkFile: defineEndpoint<LinkFileRequestDto, ApplicationResourcesDto>({
      method: "POST",
      path: apiEndpoints.applications.files,
    }),
    unlinkFile: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.applications.file,
    }),
    linkCredential: defineEndpoint<LinkCredentialRequestDto, ApplicationResourcesDto>({
      method: "POST",
      path: apiEndpoints.applications.credentials,
    }),
    unlinkCredential: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.applications.credential,
    }),
    linkExternalLink: defineEndpoint<LinkExternalLinkRequestDto, ApplicationResourcesDto>({
      method: "POST",
      path: apiEndpoints.applications.externalLinks,
    }),
    unlinkExternalLink: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.applications.externalLink,
    }),
  },
  mapper: {
    mergeApplicationResources,
    toApplicationCreateRequest,
    toApplicationDetail,
    toApplicationListItem,
    toApplicationStatusDto,
    toApplicationUpdateRequest,
  },
};

export async function fetchApplications(
  query?: ApplicationQueryDto,
): Promise<ApplicationListItem[]> {
  const dtos = await apiClient<ApplicationDto[]>(apiEndpoints.applications.list, { query });
  return dtos.map(toApplicationListItem);
}

export async function fetchApplication(id: string): Promise<ApplicationDetail> {
  const dto = await apiClient<ApplicationDto>(apiEndpoints.applications.detail(id));
  return toApplicationDetail(dto);
}

export async function createApplication(
  payload: ApplicationSavePayload,
): Promise<ApplicationDetail> {
  const dto = await apiClient<ApplicationDto>(apiEndpoints.applications.list, {
    method: "POST",
    body: toApplicationCreateRequest(payload),
  });
  return toApplicationDetail(dto);
}

export async function updateApplication(
  id: string,
  payload: ApplicationSavePayload,
): Promise<ApplicationDetail> {
  const dto = await apiClient<ApplicationDto>(apiEndpoints.applications.detail(id), {
    method: "PATCH",
    body: toApplicationUpdateRequest(payload),
  });
  return toApplicationDetail(dto);
}

export async function updateApplicationStatus(
  id: string,
  status: Parameters<typeof toApplicationStatusDto>[0],
): Promise<ApplicationDetail> {
  const statusDto: ApplicationStatusDto = toApplicationStatusDto(status);
  const dto = await apiClient<ApplicationDto>(apiEndpoints.applications.status(id), {
    method: "PATCH",
    body: { status: statusDto },
  });
  return toApplicationDetail(dto);
}

export async function deleteApplication(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.applications.detail(id), { method: "DELETE" });
}

export const applicationApiContract: ApiModuleContract = {
  moduleName: "applicationApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/applications",
    "POST /api/applications",
    "GET /api/applications/{id}",
    "PATCH /api/applications/{id}",
    "PATCH /api/applications/{id}/status",
    "DELETE /api/applications/{id}",
  ],
  notes: [
    "초기 목록은 페이지네이션 없이 배열입니다.",
    "DTO의 status/season enum은 mapper에서 화면용 한국어 ViewModel로 변환합니다.",
    "현재 화면 교체는 하지 않고 API 모듈만 준비합니다.",
  ],
};
