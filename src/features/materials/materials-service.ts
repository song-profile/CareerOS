import { getCurrentUser } from "@/features/auth/api/auth-api";
import {
  createCredential,
  deleteCredential,
  fetchCredentialNumber,
  updateCredential,
} from "@/features/materials/api/credential-api";
import {
  fetchExternalLinks,
} from "@/features/materials/api/external-link-api";
import {
  fetchFiles,
} from "@/features/materials/api/file-api";
import { createUserProfileFromAuthUser } from "@/features/materials/profile-utils";
import {
  getApiClientErrorMessage,
  getHttpStatusFromError,
} from "@/lib/api/error-message";
import type {
  CredentialDetail,
  CredentialFormValues,
  ExternalLink,
  MaterialFile,
  UserProfile,
} from "@/features/materials/types";

export type MaterialsResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function getUserProfile(): Promise<MaterialsResult<UserProfile>> {
  return wrapMaterialsRequest(
    async () => createUserProfileFromAuthUser(await getCurrentUser()),
    "기본정보를 불러올 수 없습니다.",
  );
}

export async function getMaterialFiles(): Promise<MaterialsResult<MaterialFile[]>> {
  return wrapMaterialsRequest(() => fetchFiles(), "파일 목록을 불러올 수 없습니다.");
}

export async function getExternalLinks(): Promise<MaterialsResult<ExternalLink[]>> {
  return wrapMaterialsRequest(() => fetchExternalLinks(), "외부 링크를 불러올 수 없습니다.");
}

export async function saveCredential(
  credentialId: string | null,
  values: CredentialFormValues,
): Promise<MaterialsResult<CredentialDetail>> {
  return wrapMaterialsRequest(
    () => credentialId ? updateCredential(credentialId, values) : createCredential(values),
    credentialId ? "자격 정보를 수정할 수 없습니다." : "자격 정보를 등록할 수 없습니다.",
  );
}

export async function removeCredential(
  credentialId: string,
): Promise<MaterialsResult<void>> {
  return wrapMaterialsRequest(
    () => deleteCredential(credentialId),
    "자격 정보를 삭제할 수 없습니다.",
  );
}

export async function getCredentialNumber(
  credentialId: string,
): Promise<MaterialsResult<string>> {
  return wrapMaterialsRequest(
    () => fetchCredentialNumber(credentialId),
    "자격번호를 불러올 수 없습니다.",
  );
}

async function wrapMaterialsRequest<TValue>(
  request: () => Promise<TValue>,
  fallbackMessage: string,
): Promise<MaterialsResult<TValue>> {
  try {
    return { ok: true, value: await request() };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error, fallbackMessage), status: getStatus(error) };
  }
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return getApiClientErrorMessage(error, fallbackMessage);
}

function getStatus(error: unknown): number | undefined {
  return getHttpStatusFromError(error);
}
