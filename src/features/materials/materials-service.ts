import { apiEndpoints } from "@/lib/api/endpoints";
import { getApiErrorMessage } from "@/lib/api/errors";
import { serverApiRequest } from "@/lib/api/server-client";
import {
  externalLinkMockData,
  materialFileMockData,
  userProfileMockData,
} from "@/features/materials/mock-data";
import type {
  CredentialDto,
  CredentialNumberDto,
} from "@/features/materials/api/dto";
import {
  toCredentialDetailViewModel,
  toCredentialViewModel,
} from "@/features/materials/api/mapper";
import type {
  Credential,
  CredentialDetail,
  ExternalLink,
  MaterialFile,
  UserProfile,
} from "@/features/materials/types";

/**
 * 내 취업자료의 서버 컴포넌트 전용 데이터 접근 지점.
 *
 * 이 파일은 next/headers에 의존하므로 클라이언트 컴포넌트에서 import하면 안 된다.
 * 등록·수정·삭제는 브라우저에서 일어나므로 features/materials/api/*-api.ts를 쓴다.
 *
 * 자격증은 실제 API에 연결되어 있고, 파일·링크·기본정보는 아직 목 구현이다.
 *
 * - getUserProfile     -> 목 (프로필 endpoint 명세 미정, 백엔드 확정 필요)
 * - getCredentials     -> GET /api/credentials
 * - getCredential      -> GET /api/credentials/{id}
 * - getCredentialNumber-> GET /api/credentials/{id}/number
 * - getMaterialFiles   -> 목 (GET /api/files 배선 예정)
 * - getExternalLinks   -> 목 (GET /api/external-links 배선 예정)
 *
 * 자격번호는 민감 정보다. 어떤 함수도 값을 로그로 남기지 않고 오류 메시지에도 넣지 않는다.
 */

export type MaterialsResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string };

export async function getUserProfile(): Promise<MaterialsResult<UserProfile>> {
  return { ok: true, value: userProfileMockData };
}

export async function getCredentials(): Promise<MaterialsResult<Credential[]>> {
  try {
    const dtos = await serverApiRequest<CredentialDto[]>(apiEndpoints.credentials.list);
    return { ok: true, value: dtos.map(toCredentialViewModel) };
  } catch (error) {
    return { ok: false, message: getApiErrorMessage(error, "자격 정보를 조회") };
  }
}

export async function getCredential(
  credentialId: string,
): Promise<MaterialsResult<CredentialDetail>> {
  try {
    const dto = await serverApiRequest<CredentialDto>(
      apiEndpoints.credentials.detail(credentialId),
    );
    return { ok: true, value: toCredentialDetailViewModel(dto) };
  } catch (error) {
    return { ok: false, message: getApiErrorMessage(error, "자격 정보를 조회") };
  }
}

/**
 * 마스킹 없는 자격번호. 수정 화면이 기존 값을 그대로 다시 저장할 수 있게 하려고 쓴다.
 *
 * 호출할 때마다 서버에 접근 기록이 남으므로, 번호가 있는 자격을 수정할 때만 부른다
 * (hasCredentialNumber로 먼저 거른다 — 번호가 없으면 서버가 404로 답한다).
 */
export async function getCredentialNumber(
  credentialId: string,
): Promise<MaterialsResult<string>> {
  try {
    const dto = await serverApiRequest<CredentialNumberDto>(
      apiEndpoints.credentials.number(credentialId),
    );
    return { ok: true, value: dto.credentialNumber };
  } catch (error) {
    // 값 자체는 어떤 경로로도 메시지에 넣지 않는다.
    return { ok: false, message: getApiErrorMessage(error, "자격번호를 조회") };
  }
}

export async function getMaterialFiles(): Promise<MaterialsResult<MaterialFile[]>> {
  return { ok: true, value: materialFileMockData };
}

export async function getExternalLinks(): Promise<MaterialsResult<ExternalLink[]>> {
  return { ok: true, value: externalLinkMockData };
}
