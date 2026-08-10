import { apiClient, createApiUrl, parseResponseBody } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import { createHttpError, createNetworkError } from "@/lib/api/errors";
import { defineEndpoint } from "@/lib/api/prepared-api";
import type { ApiModuleContract } from "@/lib/api/types";
import type { MaterialFile, MaterialFileType } from "@/features/materials/types";
import type { FileAssetDto, FileCategoryDto } from "@/features/materials/api/dto";
import {
  toFileCategoryDto,
  toMaterialFileViewModel,
} from "@/features/materials/api/mapper";

export interface FileQuery {
  category?: FileCategoryDto;
}

export interface UploadFilePayload {
  file: File;
  category: FileCategoryDto;
  displayName?: string;
}

export const fileApi = {
  endpoints: {
    list: defineEndpoint<FileQuery | undefined, FileAssetDto[], MaterialFile[]>({
      method: "GET",
      path: apiEndpoints.files.list,
      response: (dtos) => dtos.map(toMaterialFileViewModel),
    }),
    upload: defineEndpoint<UploadFilePayload, FileAssetDto, MaterialFile>({
      method: "POST",
      path: apiEndpoints.files.list,
      response: toMaterialFileViewModel,
    }),
    detail: defineEndpoint<void, FileAssetDto, MaterialFile>({
      method: "GET",
      path: apiEndpoints.files.detail,
      response: toMaterialFileViewModel,
    }),
    versions: defineEndpoint<void, FileAssetDto[], MaterialFile[]>({
      method: "GET",
      path: apiEndpoints.files.versions,
      response: (dtos) => dtos.map(toMaterialFileViewModel),
    }),
    uploadVersion: defineEndpoint<UploadFilePayload, FileAssetDto, MaterialFile>({
      method: "POST",
      path: apiEndpoints.files.versions,
      response: toMaterialFileViewModel,
    }),
    download: defineEndpoint({
      method: "GET",
      path: apiEndpoints.files.download,
    }),
    delete: defineEndpoint({
      method: "DELETE",
      path: apiEndpoints.files.detail,
    }),
  },
  mapper: {
    toFileCategoryDto,
    toMaterialFileViewModel,
  },
};

export async function fetchFiles(query?: FileQuery): Promise<MaterialFile[]> {
  const dtos = await apiClient<FileAssetDto[]>(apiEndpoints.files.list, { query });
  return dtos.map(toMaterialFileViewModel);
}

export async function fetchFile(id: string): Promise<MaterialFile> {
  const dto = await apiClient<FileAssetDto>(apiEndpoints.files.detail(id));
  return toMaterialFileViewModel(dto);
}

export async function fetchFileVersions(id: string): Promise<MaterialFile[]> {
  const dtos = await apiClient<FileAssetDto[]>(apiEndpoints.files.versions(id));
  return dtos.map(toMaterialFileViewModel);
}

export async function uploadFile(payload: UploadFilePayload): Promise<MaterialFile> {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("category", payload.category);

  if (payload.displayName?.trim()) {
    formData.append("displayName", payload.displayName.trim());
  }

  const dto = await apiClient<FileAssetDto>(apiEndpoints.files.list, {
    method: "POST",
    body: formData,
  });

  return toMaterialFileViewModel(dto);
}

export async function uploadMaterialFile(
  file: File,
  type: MaterialFileType,
  displayName?: string,
): Promise<MaterialFile> {
  return uploadFile({ file, category: toFileCategoryDto(type), displayName });
}

export async function uploadFileVersion(
  fileId: string,
  file: File,
  displayName?: string,
): Promise<MaterialFile> {
  const formData = new FormData();
  formData.append("file", file);

  if (displayName?.trim()) {
    formData.append("displayName", displayName.trim());
  }

  const dto = await apiClient<FileAssetDto>(apiEndpoints.files.versions(fileId), {
    method: "POST",
    body: formData,
  });

  return toMaterialFileViewModel(dto);
}

export function getFileDownloadUrl(id: string): string {
  return createApiUrl(apiEndpoints.files.download(id));
}

export async function downloadFileBlob(id: string): Promise<Blob> {
  let response: Response;

  try {
    response = await fetch(getFileDownloadUrl(id), { credentials: "include" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw createNetworkError(message, error);
  }

  if (!response.ok) {
    throw createHttpError(response.status, await parseResponseBody(response), response.headers);
  }

  return response.blob();
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.files.detail(id), { method: "DELETE" });
}

export const fileApiContract: ApiModuleContract = {
  moduleName: "fileApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/files",
    "POST /api/files",
    "GET /api/files/{id}",
    "GET /api/files/{id}/versions",
    "POST /api/files/{id}/versions",
    "GET /api/files/{id}/download",
    "DELETE /api/files/{id}",
  ],
  notes: [
    "multipart 필드는 file, category, displayName입니다.",
    "FormData 요청은 Content-Type을 직접 지정하지 않습니다.",
    "다운로드는 백엔드 attachment endpoint를 사용하며 공개 URL은 없습니다.",
  ],
};
