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
