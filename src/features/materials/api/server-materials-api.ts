import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
import { createApiUrl } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { createServerCookieHeader } from "@/lib/api/server-cookie";
import type { ApiQueryParams } from "@/lib/api/types";
import type {
  CredentialDto,
  CredentialNumberDto,
  ExternalLinkDto,
  FileAssetDto,
  PersonalInfoDto,
} from "@/features/materials/api/dto";
import {
  toCredentialDetailViewModel,
  toCredentialViewModel,
  toExternalLinkViewModel,
  toMaterialFileViewModel,
  toUserProfileViewModel,
} from "@/features/materials/api/mapper";
import type {
  Credential,
  CredentialDetail,
  ExternalLink,
  MaterialFile,
  UserProfile,
} from "@/features/materials/types";

export type ServerMaterialsResult<TValue> =
  | { ok: true; value: TValue }
  | { ok: false; message: string; status?: number };

export async function getUserProfileForCurrentUser(): Promise<
  ServerMaterialsResult<UserProfile>
> {
  const authResult = await getCurrentUserFromSession();

  if (authResult.status !== "authenticated") {
    return {
      ok: false,
      message: authResult.status === "unauthenticated"
        ? "로그인이 필요합니다."
        : authResult.message,
      status: authResult.status === "unauthenticated" ? 401 : undefined,
    };
  }

  const profileResult = await serverMaterialsRequest<PersonalInfoDto>(
    apiEndpoints.profile.detail,
    "기본정보를 불러올 수 없습니다.",
  );

  return profileResult.ok
    ? { ok: true, value: toUserProfileViewModel(authResult.user, profileResult.value) }
    : profileResult;
}

export async function getCredentialsForCurrentUser(): Promise<
  ServerMaterialsResult<Credential[]>
> {
  const result = await serverMaterialsRequest<CredentialDto[]>(
    apiEndpoints.credentials.list,
    "자격 정보를 불러올 수 없습니다.",
  );

  return result.ok
    ? { ok: true, value: result.value.map(toCredentialViewModel) }
    : result;
}

export async function getCredentialForCurrentUser(
  id: string,
): Promise<ServerMaterialsResult<CredentialDetail>> {
  const result = await serverMaterialsRequest<CredentialDto>(
    apiEndpoints.credentials.detail(id),
    "자격 정보를 불러올 수 없습니다.",
  );

  return result.ok
    ? { ok: true, value: toCredentialDetailViewModel(result.value) }
    : result;
}

export async function getCredentialNumberForCurrentUser(
  id: string,
): Promise<ServerMaterialsResult<string>> {
  const result = await serverMaterialsRequest<CredentialNumberDto>(
    apiEndpoints.credentials.number(id),
    "자격번호를 불러올 수 없습니다.",
  );

  return result.ok ? { ok: true, value: result.value.credentialNumber } : result;
}

export async function getMaterialFilesForCurrentUser(): Promise<
  ServerMaterialsResult<MaterialFile[]>
> {
  const result = await serverMaterialsRequest<FileAssetDto[]>(
    apiEndpoints.files.list,
    "파일 목록을 불러올 수 없습니다.",
  );

  return result.ok
    ? { ok: true, value: result.value.map(toMaterialFileViewModel) }
    : result;
}

export async function getExternalLinksForCurrentUser(): Promise<
  ServerMaterialsResult<ExternalLink[]>
> {
  const result = await serverMaterialsRequest<ExternalLinkDto[]>(
    apiEndpoints.externalLinks.list,
    "외부 링크를 불러올 수 없습니다.",
  );

  return result.ok
    ? { ok: true, value: result.value.map(toExternalLinkViewModel) }
    : result;
}

async function serverMaterialsRequest<TValue>(
  path: string,
  fallbackMessage: string,
  query?: ApiQueryParams,
): Promise<ServerMaterialsResult<TValue>> {
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
        message: response.status === 401 ? "로그인이 필요합니다." : fallbackMessage,
        status: response.status,
      };
    }

    return { ok: true, value: (await response.json()) as TValue };
  } catch {
    return { ok: false, message: fallbackMessage };
  }
}
