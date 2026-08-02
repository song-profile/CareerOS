import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type {
  Credential,
  CredentialDetail,
  CredentialFormValues,
} from "@/features/materials/types";
import type { CredentialDto, CredentialNumberDto, CredentialTypeDto } from "@/features/materials/api/dto";
import {
  toCredentialDetailViewModel,
  toCredentialRequestDto,
  toCredentialViewModel,
} from "@/features/materials/api/mapper";

export interface CredentialQuery {
  type?: CredentialTypeDto;
  expiringInDays?: number;
}

export const credentialApi = {
  endpoints: {
    list: defineEndpoint<CredentialQuery | undefined, CredentialDto[], Credential[]>({
      method: "GET",
      path: apiEndpoints.credentials.list,
      response: (dtos) => dtos.map(toCredentialViewModel),
    }),
    create: defineEndpoint<CredentialFormValues, CredentialDto, CredentialDetail>({
      method: "POST",
      path: apiEndpoints.credentials.list,
      request: (values) => toCredentialRequestDto(values),
      response: toCredentialDetailViewModel,
    }),
    detail: defineEndpoint<void, CredentialDto, CredentialDetail>({
      method: "GET",
      path: apiEndpoints.credentials.detail,
      response: toCredentialDetailViewModel,
    }),
    update: defineEndpoint<CredentialFormValues, CredentialDto, CredentialDetail>({
      method: "PATCH",
      path: apiEndpoints.credentials.detail,
      request: (values) => toCredentialRequestDto(values),
      response: toCredentialDetailViewModel,
    }),
    delete: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.credentials.detail,
    }),
    number: defineEndpoint<void, CredentialNumberDto, string>({
      method: "GET",
      path: apiEndpoints.credentials.number,
      response: (dto) => dto.credentialNumber,
    }),
  },
  mapper: {
    toCredentialDetailViewModel,
    toCredentialRequestDto,
    toCredentialViewModel,
  },
};

export async function fetchCredentials(query?: CredentialQuery): Promise<Credential[]> {
  const dtos = await apiClient<CredentialDto[]>(apiEndpoints.credentials.list, { query });
  return dtos.map(toCredentialViewModel);
}

export async function fetchCredential(id: string): Promise<CredentialDetail> {
  const dto = await apiClient<CredentialDto>(apiEndpoints.credentials.detail(id));
  return toCredentialDetailViewModel(dto);
}

export async function createCredential(
  values: CredentialFormValues,
  fileAssetId: number | null = null,
): Promise<CredentialDetail> {
  const dto = await apiClient<CredentialDto>(apiEndpoints.credentials.list, {
    method: "POST",
    body: toCredentialRequestDto(values, fileAssetId),
  });
  return toCredentialDetailViewModel(dto);
}

export async function updateCredential(
  id: string,
  values: CredentialFormValues,
  fileAssetId: number | null = null,
): Promise<CredentialDetail> {
  const dto = await apiClient<CredentialDto>(apiEndpoints.credentials.detail(id), {
    method: "PATCH",
    body: toCredentialRequestDto(values, fileAssetId),
  });
  return toCredentialDetailViewModel(dto);
}

export async function deleteCredential(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.credentials.detail(id), { method: "DELETE" });
}

export async function fetchCredentialNumber(id: string): Promise<string> {
  const dto = await apiClient<CredentialNumberDto>(apiEndpoints.credentials.number(id));
  return dto.credentialNumber;
}

export const credentialApiContract: ApiModuleContract = {
  moduleName: "credentialApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/credentials",
    "POST /api/credentials",
    "GET /api/credentials/{id}",
    "PATCH /api/credentials/{id}",
    "DELETE /api/credentials/{id}",
    "GET /api/credentials/{id}/number",
  ],
  notes: [
    "목록·상세 응답은 credentialNumberMasked만 사용합니다.",
    "전체 자격번호는 명시적 조회 endpoint에서만 가져오며 접근 기록이 남습니다.",
    "PATCH는 전체 교체 방식입니다.",
  ],
};
