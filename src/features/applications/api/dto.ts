export type ApplicationStatusDto =
  | "INTERESTED"
  | "WRITING"
  | "SUBMITTED"
  | "DOCUMENT_RESULT"
  | "TEST"
  | "INTERVIEW"
  | "FINAL_ACCEPTED"
  | "FINAL_REJECTED";

export type RecruitmentSeasonDto = "FIRST_HALF" | "SECOND_HALF" | "ROLLING";

export interface ApplicationStatusHistoryDto {
  id: number;
  previousStatus: ApplicationStatusDto | null;
  newStatus: ApplicationStatusDto;
  changedAt: string;
}

export interface ApplicationDto {
  id: number;
  companyId: number;
  companyName: string;
  companyHomepageUrl: string | null;
  positionName: string;
  recruitmentTitle: string | null;
  recruitmentYear: number;
  season: RecruitmentSeasonDto;
  postingUrl: string | null;
  applicationStartAt: string | null;
  deadlineAt: string | null;
  status: ApplicationStatusDto;
  workLocation: string | null;
  applicationSiteUrl: string | null;
  memo: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistories: ApplicationStatusHistoryDto[];
}

export interface ApplicationRequestDto {
  companyName: string;
  companyHomepageUrl: string | null;
  companyMemo: string | null;
  positionName: string;
  recruitmentTitle: string | null;
  recruitmentYear: number;
  season: RecruitmentSeasonDto;
  postingUrl: string | null;
  applicationStartAt: string | null;
  deadlineAt: string | null;
  status: ApplicationStatusDto;
  workLocation: string | null;
  applicationSiteUrl: string | null;
  memo: string | null;
}

export type ApplicationUpdateRequestDto = Omit<ApplicationRequestDto, "status">;

export interface ApplicationStatusUpdateRequestDto {
  status: ApplicationStatusDto;
}

export interface ApplicationQueryDto {
  status?: ApplicationStatusDto;
  company?: string;
  position?: string;
  recruitmentYear?: number;
  season?: RecruitmentSeasonDto;
  keyword?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface ApplicationFileResourceDto {
  id: number;
  fileAssetId: number;
  category: string;
  displayName: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  lockedVersion: number;
  downloadUrl: string;
  purpose: string | null;
  linkedAt: string;
}

export interface ApplicationCredentialResourceDto {
  id: number;
  credentialId: number;
  credentialType: string;
  name: string;
  issuer: string | null;
  purpose: string | null;
  linkedAt: string;
}

export interface ApplicationExternalLinkResourceDto {
  id: number;
  externalLinkId: number;
  linkType: string;
  displayName: string;
  url: string;
  purpose: string | null;
  linkedAt: string;
}

export interface EssayQuestionSummaryDto {
  id: number;
  questionOrder: number;
  questionText: string;
  commonQuestionType: string;
  hasSubmittedAnswer: boolean;
  submittedAnswerId: number | null;
  submittedAnswerVersion: number | null;
  submittedAt: string | null;
}

export interface ApplicationResourcesDto {
  applicationId: number;
  files: ApplicationFileResourceDto[];
  credentials: ApplicationCredentialResourceDto[];
  externalLinks: ApplicationExternalLinkResourceDto[];
  essayQuestions: EssayQuestionSummaryDto[];
}

export interface LinkFileRequestDto {
  fileAssetId: number;
  purpose: string | null;
}

export interface LinkCredentialRequestDto {
  credentialId: number;
  purpose: string | null;
}

export interface LinkExternalLinkRequestDto {
  externalLinkId: number;
  purpose: string | null;
}
