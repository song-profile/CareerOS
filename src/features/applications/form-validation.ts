import {
  APPLICATION_MEMO_MAX_LENGTH,
  type ApplicationFormErrors,
  type ApplicationFormValues,
  type ApplicationSavePayload,
} from "@/features/applications/form-types";

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidYear(value: string): boolean {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100;
}

function isValidDate(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function validateApplicationForm(values: ApplicationFormValues): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};

  if (isBlank(values.companyName)) {
    errors.companyName = "회사명을 입력하세요.";
  }

  if (isBlank(values.position)) {
    errors.position = "직무명을 입력하세요.";
  }

  if (isBlank(values.recruitmentYear)) {
    errors.recruitmentYear = "채용연도를 입력하세요.";
  } else if (!isValidYear(values.recruitmentYear)) {
    errors.recruitmentYear = "채용연도는 2000년부터 2100년 사이로 입력하세요.";
  }

  if (!values.season) {
    errors.season = "채용시기를 선택하세요.";
  }

  if (!isValidUrl(values.postingUrl)) {
    errors.postingUrl = "공고 URL은 http 또는 https 주소여야 합니다.";
  }

  if (isBlank(values.workLocation)) {
    errors.workLocation = "근무지역을 입력하세요.";
  }

  if (!isValidDate(values.startDate)) {
    errors.startDate = "지원 시작일을 선택하세요.";
  }

  if (!isValidDate(values.deadline)) {
    errors.deadline = "지원 마감일을 선택하세요.";
  }

  if (isValidDate(values.startDate) && isValidDate(values.deadline)) {
    const startDate = new Date(values.startDate);
    const deadline = new Date(values.deadline);

    if (deadline.getTime() < startDate.getTime()) {
      errors.deadline = "지원 마감일은 시작일 이후여야 합니다.";
    }
  }

  if (!values.status) {
    errors.status = "현재 상태를 선택하세요.";
  }

  if (values.memo.length > APPLICATION_MEMO_MAX_LENGTH) {
    errors.memo = `메모는 ${APPLICATION_MEMO_MAX_LENGTH}자 이하로 입력하세요.`;
  }

  return errors;
}

export function hasApplicationFormErrors(errors: ApplicationFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toApplicationSavePayload(values: ApplicationFormValues): ApplicationSavePayload {
  return {
    companyName: values.companyName.trim(),
    position: values.position.trim(),
    recruitmentYear: Number(values.recruitmentYear),
    season: values.season || "수시",
    postingUrl: values.postingUrl.trim(),
    workLocation: values.workLocation.trim(),
    startDate: values.startDate,
    deadline: values.deadline,
    status: values.status || "관심",
    memo: values.memo.trim(),
  };
}
