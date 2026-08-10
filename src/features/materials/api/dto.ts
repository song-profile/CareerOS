export type CredentialTypeDto =
  | "CERTIFICATION"
  | "LANGUAGE"
  | "AWARD"
  | "EDUCATION_DOCUMENT"
  | "OTHER";

export interface CredentialDto {
  id: number;
  credentialType: CredentialTypeDto;
  name: string;
  issuer: string | null;
  acquiredAt: string;
  credentialNumberMasked: string | null;
  hasCredentialNumber: boolean;
  score: string | null;
  grade: string | null;
  validFrom: string | null;
  expiresAt: string | null;
  permanent: boolean;
  description: string | null;
  usageMemo: string | null;
  studyMemo: string | null;
  referenceUrl: string | null;
  fileAssetId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialRequestDto {
  credentialType: CredentialTypeDto;
  name: string;
  issuer: string | null;
  acquiredAt: string;
  credentialNumber: string | null;
  score: string | null;
  grade: string | null;
  validFrom: string | null;
  expiresAt: string | null;
  permanent: boolean;
  description: string | null;
  usageMemo: string | null;
  studyMemo: string | null;
  referenceUrl: string | null;
  fileAssetId: number | null;
}

export interface CredentialNumberDto {
  credentialId: number;
  credentialNumber: string;
}

export type GraduationStatusDto =
  | "ENROLLED"
  | "GRADUATED"
  | "EXPECTED"
  | "LEAVE_OF_ABSENCE"
  | "COMPLETED"
  | "OTHER";

export type MilitaryStatusDto =
  | "NOT_APPLICABLE"
  | "NOT_SERVED"
  | "SERVING"
  | "COMPLETED"
  | "EXEMPTED"
  | "OTHER";

export interface PersonalInfoDto {
  phone: string | null;
  address: string | null;
  schoolName: string | null;
  major: string | null;
  doubleMajor: string | null;
  minor: string | null;
  graduationStatus: GraduationStatusDto | null;
  graduationDate: string | null;
  gpa: number | null;
  gpaScale: number | null;
  militaryStatus: MilitaryStatusDto | null;
  militaryBranch: string | null;
  militaryRank: string | null;
  militaryDischargeDate: string | null;
  careerSummary: string | null;
  updatedAt: string | null;
}

export interface PersonalInfoRequestDto {
  phone: string | null;
  address: string | null;
  schoolName: string | null;
  major: string | null;
  doubleMajor: string | null;
  minor: string | null;
  graduationStatus: GraduationStatusDto | null;
  graduationDate: string | null;
  gpa: number | null;
  gpaScale: number | null;
  militaryStatus: MilitaryStatusDto | null;
  militaryBranch: string | null;
  militaryRank: string | null;
  militaryDischargeDate: string | null;
  careerSummary: string | null;
}

export type FileCategoryDto =
  | "PROFILE_PHOTO"
  | "TRANSCRIPT"
  | "GRADUATION_CERTIFICATE"
  | "CREDENTIAL_PROOF"
  | "CAREER_CERTIFICATE"
  | "PORTFOLIO"
  | "OTHER";

export interface FileAssetDto {
  id: number;
  category: FileCategoryDto;
  displayName: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  version: number;
  parentAssetId: number | null;
  rootAssetId: number;
  latest: boolean;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type LinkTypeDto =
  | "GITHUB"
  | "NOTION"
  | "BLOG"
  | "VELOG"
  | "PORTFOLIO"
  | "LINKEDIN"
  | "DEPLOYED_SERVICE"
  | "PROJECT_REPOSITORY"
  | "OTHER";

export type LinkVisibilityDto = "PRIVATE" | "PUBLIC";

export interface ExternalLinkDto {
  id: number;
  linkType: LinkTypeDto;
  displayName: string;
  url: string;
  description: string | null;
  visibility: LinkVisibilityDto | null;
  projectName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalLinkRequestDto {
  linkType: LinkTypeDto;
  displayName: string;
  url: string;
  description: string | null;
  visibility: LinkVisibilityDto;
  projectName: string | null;
}
