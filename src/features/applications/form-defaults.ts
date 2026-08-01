import type { ApplicationFormValues } from "@/features/applications/form-types";
import type { ApplicationListItem } from "@/features/applications/types";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateTimeInputValue(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function createEmptyApplicationFormValues(): ApplicationFormValues {
  const currentYear = new Date().getFullYear();

  return {
    companyName: "",
    position: "",
    recruitmentYear: String(currentYear),
    season: "",
    postingUrl: "",
    workLocation: "",
    startDate: "",
    deadline: "",
    status: "관심",
    memo: "",
  };
}

export function createApplicationFormValuesFromListItem(
  application: ApplicationListItem,
): ApplicationFormValues {
  return {
    companyName: application.companyName,
    position: application.position,
    recruitmentYear: String(application.recruitmentYear),
    season: application.season,
    postingUrl: "",
    workLocation: "서울",
    startDate: toDateInputValue(application.createdAt),
    deadline: toDateTimeInputValue(application.deadline),
    status: application.status,
    memo: "",
  };
}
