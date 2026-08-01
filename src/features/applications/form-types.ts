import type { ApplicationStatus, RecruitmentSeason } from "@/features/applications/types";

export interface ApplicationFormValues {
  companyName: string;
  position: string;
  recruitmentYear: string;
  season: RecruitmentSeason | "";
  postingUrl: string;
  workLocation: string;
  startDate: string;
  deadline: string;
  status: ApplicationStatus | "";
  memo: string;
}

export interface ApplicationFormErrors {
  companyName?: string;
  position?: string;
  recruitmentYear?: string;
  season?: string;
  postingUrl?: string;
  workLocation?: string;
  startDate?: string;
  deadline?: string;
  status?: string;
  memo?: string;
}

export interface ApplicationSavePayload {
  companyName: string;
  position: string;
  recruitmentYear: number;
  season: RecruitmentSeason;
  postingUrl: string;
  workLocation: string;
  startDate: string;
  deadline: string;
  status: ApplicationStatus;
  memo: string;
}

export const APPLICATION_MEMO_MAX_LENGTH = 500;
