import type { CredentialFormValues } from "@/features/materials/types";
import type {
  Credential,
  CredentialDetail,
  CredentialType,
  ExternalLink,
  ExternalLinkFormValues,
  ExternalLinkType,
  MaterialFile,
  MaterialFileType,
} from "@/features/materials/types";
import type {
  CredentialDto,
  CredentialRequestDto,
  CredentialTypeDto,
  ExternalLinkDto,
  ExternalLinkRequestDto,
  FileAssetDto,
  FileCategoryDto,
  LinkTypeDto,
} from "@/features/materials/api/dto";

const CREDENTIAL_TYPE_TO_VIEW: Record<CredentialTypeDto, CredentialType> = {
  CERTIFICATION: "자격증",
  LANGUAGE: "어학",
  AWARD: "수상",
  EDUCATION_DOCUMENT: "교육",
  OTHER: "기타",
};

const CREDENTIAL_TYPE_TO_DTO: Record<CredentialType, CredentialTypeDto> = {
  자격증: "CERTIFICATION",
  어학: "LANGUAGE",
  수상: "AWARD",
  교육: "EDUCATION_DOCUMENT",
  기타: "OTHER",
};

const FILE_CATEGORY_TO_VIEW: Record<FileCategoryDto, MaterialFileType> = {
  PROFILE_PHOTO: "증명사진",
  TRANSCRIPT: "성적증명서",
  GRADUATION_CERTIFICATE: "졸업증명서",
  CREDENTIAL_PROOF: "자격증",
  CAREER_CERTIFICATE: "기타",
  PORTFOLIO: "포트폴리오",
  OTHER: "기타",
};

const MATERIAL_FILE_TYPE_TO_DTO: Record<MaterialFileType, FileCategoryDto> = {
  증명사진: "PROFILE_PHOTO",
  포트폴리오: "PORTFOLIO",
  성적증명서: "TRANSCRIPT",
  졸업증명서: "GRADUATION_CERTIFICATE",
  자격증: "CREDENTIAL_PROOF",
  기타: "OTHER",
};

const LINK_TYPE_TO_VIEW: Record<LinkTypeDto, ExternalLinkType> = {
  GITHUB: "GitHub",
  NOTION: "Notion",
  BLOG: "Blog",
  VELOG: "Velog",
  PORTFOLIO: "Portfolio",
  LINKEDIN: "LinkedIn",
  DEPLOYED_SERVICE: "Portfolio",
  PROJECT_REPOSITORY: "GitHub",
  OTHER: "기타",
};

const LINK_TYPE_TO_DTO: Record<ExternalLinkType, LinkTypeDto> = {
  GitHub: "GITHUB",
  Notion: "NOTION",
  Velog: "VELOG",
  Blog: "BLOG",
  Portfolio: "PORTFOLIO",
  LinkedIn: "LINKEDIN",
  기타: "OTHER",
};

export function toCredentialViewModel(dto: CredentialDto): Credential {
  return {
    id: String(dto.id),
    credentialType: CREDENTIAL_TYPE_TO_VIEW[dto.credentialType],
    name: dto.name,
    issuer: dto.issuer ?? "",
    acquiredAt: toDate(dto.acquiredAt),
    credentialNumber: dto.credentialNumberMasked ?? "",
    score: dto.score ?? "",
    grade: dto.grade ?? "",
    validFrom: dto.validFrom ? toDate(dto.validFrom) : null,
    expiresAt: dto.expiresAt ? toDate(dto.expiresAt) : null,
    permanent: dto.permanent,
    description: dto.description ?? "",
    usageMemo: dto.usageMemo ?? "",
    studyMemo: dto.studyMemo ?? "",
    evidenceFileName: dto.fileAssetId ? `파일 #${dto.fileAssetId}` : null,
    referenceUrl: dto.referenceUrl ?? "",
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt),
  };
}

export function toCredentialDetailViewModel(dto: CredentialDto): CredentialDetail {
  return {
    ...toCredentialViewModel(dto),
    usageHistories: [],
  };
}

export function toCredentialRequestDto(
  values: CredentialFormValues,
  fileAssetId: number | null = null,
): CredentialRequestDto {
  return {
    credentialType: CREDENTIAL_TYPE_TO_DTO[values.credentialType || "기타"],
    name: values.name.trim(),
    issuer: emptyToNull(values.issuer),
    acquiredAt: values.acquiredAt,
    credentialNumber: emptyToNull(values.credentialNumber),
    score: emptyToNull(values.score),
    grade: emptyToNull(values.grade),
    validFrom: emptyToNull(values.validFrom),
    expiresAt: values.permanent ? null : emptyToNull(values.expiresAt),
    permanent: values.permanent,
    description: emptyToNull(values.description),
    usageMemo: emptyToNull(values.usageMemo),
    studyMemo: emptyToNull(values.studyMemo),
    referenceUrl: emptyToNull(values.referenceUrl),
    fileAssetId,
  };
}

export function toMaterialFileViewModel(dto: FileAssetDto): MaterialFile {
  return {
    id: String(dto.id),
    fileName: dto.displayName,
    type: FILE_CATEGORY_TO_VIEW[dto.category],
    size: dto.size,
    createdAt: toDate(dto.createdAt),
    isUsed: false,
    downloadUrl: dto.downloadUrl,
  };
}

export function toFileCategoryDto(type: MaterialFileType): FileCategoryDto {
  return MATERIAL_FILE_TYPE_TO_DTO[type];
}

export function toExternalLinkViewModel(dto: ExternalLinkDto): ExternalLink {
  return {
    id: String(dto.id),
    type: LINK_TYPE_TO_VIEW[dto.linkType],
    title: dto.displayName,
    url: dto.url,
    description: dto.description ?? "",
    createdAt: toDate(dto.createdAt),
  };
}

export function toExternalLinkRequestDto(
  values: ExternalLinkFormValues,
): ExternalLinkRequestDto {
  return {
    linkType: LINK_TYPE_TO_DTO[values.type],
    displayName: values.title.trim(),
    url: values.url.trim(),
    description: emptyToNull(values.description),
    visibility: "PRIVATE",
    projectName: null,
  };
}

function toDate(value: string): Date {
  return new Date(value);
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
