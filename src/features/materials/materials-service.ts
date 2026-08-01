import {
  credentialMockData,
  externalLinkMockData,
  materialFileMockData,
  userProfileMockData,
} from "@/features/materials/mock-data";
import type {
  Credential,
  CredentialDetail,
  CredentialFormValues,
  ExternalLink,
  MaterialFile,
  UserProfile,
} from "@/features/materials/types";

/**
 * 내 취업자료의 데이터 접근 지점.
 *
 * 전부 목 구현이며 실제 네트워크 호출을 하지 않는다. API 연동 시 이 파일의 함수 본문만
 * 교체하면 되고 화면 코드는 그대로 둔다. 기획서 API 명세 기준 교체 대상은 다음과 같다.
 *
 * - getUserProfile     -> GET   (프로필 endpoint 명세 미정, 백엔드 확정 필요)
 * - getCredentials     -> GET   /api/credentials
 * - getCredential      -> GET   /api/credentials/{id}
 * - saveCredential     -> POST  /api/credentials, PATCH /api/credentials/{id}
 * - getMaterialFiles   -> GET   /api/material-files (명세 확정 필요)
 * - getExternalLinks   -> GET   /api/material-links (명세 확정 필요)
 *
 * 자격번호는 민감 정보다. 어떤 함수도 값을 로그로 남기지 않고 오류 메시지에도 넣지 않는다.
 * 서버 응답에서 자격번호를 복호화해 내려줄지, 마스킹된 값만 내려줄지는 백엔드와 합의가 필요하다.
 */

export type MaterialsResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string };

export async function getUserProfile(): Promise<MaterialsResult<UserProfile>> {
  return { ok: true, value: userProfileMockData };
}

export async function getCredentials(): Promise<MaterialsResult<Credential[]>> {
  return { ok: true, value: credentialMockData };
}

export async function getCredential(
  credentialId: string,
): Promise<MaterialsResult<CredentialDetail>> {
  const credential = credentialMockData.find((candidate) => candidate.id === credentialId);

  if (!credential) {
    return { ok: false, message: "자격 정보를 찾을 수 없습니다." };
  }

  return { ok: true, value: credential };
}

export async function getMaterialFiles(): Promise<MaterialsResult<MaterialFile[]>> {
  return { ok: true, value: materialFileMockData };
}

export async function getExternalLinks(): Promise<MaterialsResult<ExternalLink[]>> {
  return { ok: true, value: externalLinkMockData };
}

/**
 * 등록과 수정을 함께 처리한다.
 * 지금은 저장 성공 여부만 돌려주며 실제로 데이터가 바뀌지 않는다.
 */
export async function saveCredential(
  credentialId: string | null,
  values: CredentialFormValues,
): Promise<MaterialsResult<{ savedAt: Date }>> {
  if (credentialId) {
    const exists = credentialMockData.some((candidate) => candidate.id === credentialId);

    if (!exists) {
      return { ok: false, message: "수정할 자격 정보를 찾을 수 없습니다." };
    }
  }

  // 화면에서 이미 막고 있지만 서버가 할 검증을 같은 자리에 남겨 둔다.
  if (!values.name.trim()) {
    return { ok: false, message: "자격명이 비어 있어 저장할 수 없습니다." };
  }

  if (!values.credentialType) {
    return { ok: false, message: "자격 구분이 없어 저장할 수 없습니다." };
  }

  return { ok: true, value: { savedAt: new Date() } };
}
