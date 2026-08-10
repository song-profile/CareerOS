import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type {
  PersonalInfoDto,
  PersonalInfoRequestDto,
} from "@/features/materials/api/dto";
import {
  toPersonalInfoRequestDto,
} from "@/features/materials/api/mapper";
import type { UserProfileFormValues } from "@/features/materials/types";

export const profileApi = {
  endpoints: {
    detail: defineEndpoint<void, PersonalInfoDto, PersonalInfoDto>({
      method: "GET",
      path: apiEndpoints.profile.detail,
    }),
    update: defineEndpoint<UserProfileFormValues, PersonalInfoDto, PersonalInfoDto>({
      method: "PATCH",
      path: apiEndpoints.profile.detail,
      request: (values) => toPersonalInfoRequestDto(values),
    }),
  },
  mapper: {
    toPersonalInfoRequestDto,
  },
};

export async function fetchPersonalInfo(): Promise<PersonalInfoDto> {
  return apiClient<PersonalInfoDto>(apiEndpoints.profile.detail);
}

export async function updatePersonalInfo(values: UserProfileFormValues): Promise<PersonalInfoDto> {
  return apiClient<PersonalInfoDto>(apiEndpoints.profile.detail, {
    method: "PATCH",
    body: toPersonalInfoRequestDto(values),
  });
}

export const profileApiContract: ApiModuleContract = {
  moduleName: "profileApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/profile",
    "PATCH /api/profile",
  ],
  notes: [
    "현재 로그인 사용자 기준으로 조회·수정하며 userId를 요청에 포함하지 않습니다.",
    "최초 조회 시 저장된 프로필이 없어도 null 필드의 빈 응답을 반환합니다.",
  ],
};

export type { PersonalInfoDto, PersonalInfoRequestDto };
