import { cookies } from "next/headers";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";
import { createApiUrl } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiQueryParams } from "@/lib/api/types";
import type {
  CredentialDto,
  CredentialNumberDto,
  ExternalLinkDto,
  FileAssetDto,
} from "@/features/materials/api/dto";
import {
  toCredentialDetailViewModel,
  toCredentialViewModel,
  toExternalLinkViewModel,
  toMaterialFileViewModel,
} from "@/features/materials/api/mapper";
import { createUserProfileFromAuthUser } from "@/features/materials/profile-utils";
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
  const result = await getCurrentUserFromSession();

  if (result.status === "authenticated") {
    return { ok: true, value: createUserProfileFromAuthUser(result.user) };
  }

  return {
    ok: false,
    message: result.status === "unauthenticated"
      ? "로그인이 필요합니다."
      : result.message,
    status: result.status === "unauthenticated" ? 401 : undefined,
  };
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

async function createServerCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}
