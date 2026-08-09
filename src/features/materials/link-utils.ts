import type {
  ExternalLink,
  ExternalLinkFormErrors,
  ExternalLinkFormValues,
  ExternalLinkType,
} from "@/features/materials/types";
import { EXTERNAL_LINK_DESCRIPTION_MAX_LENGTH } from "@/features/materials/types";

export const EXTERNAL_LINK_TYPES: ExternalLinkType[] = [
  "GitHub",
  "Notion",
  "Velog",
  "Blog",
  "Portfolio",
  "LinkedIn",
  "배포 서비스",
  "프로젝트 Repository",
  "기타",
];

export function formatExternalLinkDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function filterExternalLinks(
  links: ExternalLink[],
  searchQuery: string,
): ExternalLink[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return links;
  }

  return links.filter((link) => {
    return [link.title, link.url, link.description, link.type].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateExternalLinkForm(
  values: ExternalLinkFormValues,
): ExternalLinkFormErrors {
  const errors: ExternalLinkFormErrors = {};

  if (!values.type) {
    errors.type = "링크 유형을 선택해 주세요.";
  }

  if (!values.title.trim()) {
    errors.title = "제목을 입력해 주세요.";
  }

  if (!values.url.trim()) {
    errors.url = "URL을 입력해 주세요.";
  } else if (!isHttpsUrl(values.url.trim())) {
    errors.url = "http 또는 https로 시작하는 올바른 URL을 입력해 주세요.";
  }

  if (values.description.length > EXTERNAL_LINK_DESCRIPTION_MAX_LENGTH) {
    errors.description = `설명은 ${EXTERNAL_LINK_DESCRIPTION_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  return errors;
}

export function hasExternalLinkErrors(errors: ExternalLinkFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
