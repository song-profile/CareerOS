import type {
  ApplicationListItem,
  ApplicationStatus,
} from "@/features/applications/types";

export type ApplicationTimelineStep = Exclude<ApplicationStatus, "최종합격" | "불합격"> | "최종";

export type ApplicationMaterialType = "증명사진" | "포트폴리오" | "자격증" | "성적증명서";

export interface ApplicationBasicInfo {
  postingUrl: string;
  workLocation: string;
  memo: string;
}

export interface ApplicationSubmittedMaterial {
  id: string;
  type: ApplicationMaterialType;
  title: string;
  isReady: boolean;
  placeholderHref: string;
}

export interface ApplicationEssaySummary {
  questionCount: number;
  answerCount: number;
  hasSubmittedVersion: boolean;
  href: string;
}

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface ApplicationChangeHistory {
  id: string;
  status: ApplicationStatus;
  changedAt: Date;
  changedBy: string;
}

export interface ApplicationDetail extends ApplicationListItem {
  basicInfo: ApplicationBasicInfo;
  materials: ApplicationSubmittedMaterial[];
  essay: ApplicationEssaySummary;
  checklist: ApplicationChecklistItem[];
  histories: ApplicationChangeHistory[];
}
