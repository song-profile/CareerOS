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
  UserProfile,
  UserProfileFormValues,
  GraduationStatus,
  MilitaryStatus,
} from "@/features/materials/types";
import type {
  CredentialDto,
  CredentialRequestDto,
  CredentialTypeDto,
  ExternalLinkDto,
  ExternalLinkRequestDto,
  FileAssetDto,
  GraduationStatusDto,
  FileCategoryDto,
  LinkTypeDto,
  MilitaryStatusDto,
  PersonalInfoDto,
  PersonalInfoRequestDto,
} from "@/features/materials/api/dto";
import { createUserProfileFromAuthUser } from "@/features/materials/profile-utils";

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
  DEPLOYED_SERVICE: "배포 서비스",
  PROJECT_REPOSITORY: "프로젝트 Repository",
  OTHER: "기타",
};

const LINK_TYPE_TO_DTO: Record<ExternalLinkType, LinkTypeDto> = {
  GitHub: "GITHUB",
  Notion: "NOTION",
  Velog: "VELOG",
  Blog: "BLOG",
  Portfolio: "PORTFOLIO",
  LinkedIn: "LINKEDIN",
  "배포 서비스": "DEPLOYED_SERVICE",
  "프로젝트 Repository": "PROJECT_REPOSITORY",
  기타: "OTHER",
};

const GRADUATION_STATUS_TO_VIEW: Record<GraduationStatusDto, GraduationStatus> = {
  ENROLLED: "재학",
  GRADUATED: "졸업",
  EXPECTED: "졸업예정",
  LEAVE_OF_ABSENCE: "휴학",
  COMPLETED: "수료",
  OTHER: "기타",
};

const GRADUATION_STATUS_TO_DTO: Record<GraduationStatus, GraduationStatusDto> = {
  재학: "ENROLLED",
  졸업: "GRADUATED",
  졸업예정: "EXPECTED",
  휴학: "LEAVE_OF_ABSENCE",
  수료: "COMPLETED",
  기타: "OTHER",
};

const MILITARY_STATUS_TO_VIEW: Record<MilitaryStatusDto, MilitaryStatus> = {
  NOT_APPLICABLE: "해당없음",
  NOT_SERVED: "미필",
  SERVING: "복무중",
  COMPLETED: "군필",
  EXEMPTED: "면제",
  OTHER: "기타",
};

const MILITARY_STATUS_TO_DTO: Record<MilitaryStatus, MilitaryStatusDto> = {
  해당없음: "NOT_APPLICABLE",
  미필: "NOT_SERVED",
  복무중: "SERVING",
  군필: "COMPLETED",
  면제: "EXEMPTED",
  기타: "OTHER",
};

export function toCredentialViewModel(dto: CredentialDto): Credential {
  return {
    id: String(dto.id),
    credentialType: CREDENTIAL_TYPE_TO_VIEW[dto.credentialType],
    name: dto.name,
    issuer: dto.issuer ?? "",
    acquiredAt: toDate(dto.acquiredAt),
    credentialNumberMasked: dto.credentialNumberMasked ?? "",
    hasCredentialNumber: dto.hasCredentialNumber,
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

export function toUserProfileViewModel(
  authUser: { name: string; email: string },
  dto: PersonalInfoDto,
): UserProfile {
  return createUserProfileFromAuthUser({
    ...authUser,
    phone: dto.phone ?? "",
    address: dto.address ?? "",
    schoolName: dto.schoolName ?? "",
    major: dto.major ?? "",
    doubleMajor: dto.doubleMajor ?? "",
    minor: dto.minor ?? "",
    graduationStatus: dto.graduationStatus ? GRADUATION_STATUS_TO_VIEW[dto.graduationStatus] : "",
    graduationDate: dto.graduationDate ?? "",
    gpa: dto.gpa === null ? "" : String(dto.gpa),
    gpaScale: dto.gpaScale === null ? "" : String(dto.gpaScale),
    militaryStatus: dto.militaryStatus ? MILITARY_STATUS_TO_VIEW[dto.militaryStatus] : "",
    militaryBranch: dto.militaryBranch ?? "",
    militaryRank: dto.militaryRank ?? "",
    militaryDischargeDate: dto.militaryDischargeDate ?? "",
    careerSummary: dto.careerSummary ?? "",
    updatedAt: dto.updatedAt ? toDate(dto.updatedAt) : null,
  });
}

export function toUserProfileFormValues(profile: UserProfile): UserProfileFormValues {
  return {
    phone: profile.phone,
    address: profile.address,
    schoolName: profile.schoolName,
    major: profile.major,
    doubleMajor: profile.doubleMajor,
    minor: profile.minor,
    graduationStatus: profile.graduationStatus,
    graduationDate: profile.graduationDate,
    gpa: profile.gpa,
    gpaScale: profile.gpaScale,
    militaryStatus: profile.militaryStatus,
    militaryBranch: profile.militaryBranch,
    militaryRank: profile.militaryRank,
    militaryDischargeDate: profile.militaryDischargeDate,
    careerSummary: profile.careerSummary,
  };
}

export function toPersonalInfoRequestDto(values: UserProfileFormValues): PersonalInfoRequestDto {
  return {
    phone: emptyToNull(values.phone),
    address: emptyToNull(values.address),
    schoolName: emptyToNull(values.schoolName),
    major: emptyToNull(values.major),
    doubleMajor: emptyToNull(values.doubleMajor),
    minor: emptyToNull(values.minor),
    graduationStatus: values.graduationStatus
      ? GRADUATION_STATUS_TO_DTO[values.graduationStatus]
      : null,
    graduationDate: emptyToNull(values.graduationDate),
    gpa: numberOrNull(values.gpa),
    gpaScale: numberOrNull(values.gpaScale),
    militaryStatus: values.militaryStatus ? MILITARY_STATUS_TO_DTO[values.militaryStatus] : null,
    militaryBranch: emptyToNull(values.militaryBranch),
    militaryRank: emptyToNull(values.militaryRank),
    militaryDischargeDate: emptyToNull(values.militaryDischargeDate),
    careerSummary: emptyToNull(values.careerSummary),
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
    version: dto.version,
    rootAssetId: String(dto.rootAssetId),
    parentAssetId: dto.parentAssetId === null ? null : String(dto.parentAssetId),
    latest: dto.latest,
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

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return Number(trimmed);
}
