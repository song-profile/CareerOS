import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ApiModuleContract } from "@/lib/api/types";
import type { ExternalLink, ExternalLinkFormValues } from "@/features/materials/types";
import type { ExternalLinkDto } from "@/features/materials/api/dto";
import {
  toExternalLinkRequestDto,
  toExternalLinkViewModel,
} from "@/features/materials/api/mapper";

export async function fetchExternalLinks(): Promise<ExternalLink[]> {
  const dtos = await apiClient<ExternalLinkDto[]>(apiEndpoints.externalLinks.list);
  return dtos.map(toExternalLinkViewModel);
}

export async function createExternalLink(
  values: ExternalLinkFormValues,
): Promise<ExternalLink> {
  const dto = await apiClient<ExternalLinkDto>(apiEndpoints.externalLinks.list, {
    method: "POST",
    body: toExternalLinkRequestDto(values),
  });
  return toExternalLinkViewModel(dto);
}

export async function updateExternalLink(
  id: string,
  values: ExternalLinkFormValues,
): Promise<ExternalLink> {
  const dto = await apiClient<ExternalLinkDto>(apiEndpoints.externalLinks.detail(id), {
    method: "PATCH",
    body: toExternalLinkRequestDto(values),
  });
  return toExternalLinkViewModel(dto);
}

export async function deleteExternalLink(id: string): Promise<void> {
  await apiClient<void>(apiEndpoints.externalLinks.detail(id), { method: "DELETE" });
}

export const externalLinkApiContract: ApiModuleContract = {
  moduleName: "externalLinkApi",
  contractStatus: "confirmed",
  requiredEndpoints: [
    "GET /api/external-links",
    "POST /api/external-links",
    "PATCH /api/external-links/{id}",
    "DELETE /api/external-links/{id}",
  ],
  notes: [
    "URL은 서버에서 http/https 패턴으로 검증합니다.",
    "화면 ViewModel에 없는 visibility/projectName은 기본 PRIVATE/null로 보냅니다.",
  ],
};
