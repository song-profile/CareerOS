import { getDaysUntil } from "@/features/applications/date-utils";
import type {
  Credential,
  CredentialSortKey,
  CredentialType,
  CredentialValidityFilter,
  CredentialValidityStatus,
} from "@/features/materials/types";

/** 만료 경고를 시작하는 기준. 대시보드의 "만료 예정 자료"와 같은 기준을 쓴다. */
export const EXPIRY_WARNING_DAYS = 30;

/**
 * 민감한 값 마스킹.
 *
 * 앞 4자만 남기고 나머지를 가린다. 짧은 값은 앞 1자만 남겨 전체가 드러나지 않게 한다.
 * 클라이언트 마스킹은 어깨너머 노출을 막는 화면 보호일 뿐이다.
 * 원본 값이 이미 브라우저까지 내려와 있으므로, 실제 보호는 서버의 권한 검사와
 * 암호화 저장이 선행되어야 한다.
 */
export function maskValue(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.length <= 2) {
    return "*".repeat(trimmed.length);
  }

  const visibleLength = Math.min(4, Math.max(1, trimmed.length - 2));

  return `${trimmed.slice(0, visibleLength)}${"*".repeat(trimmed.length - visibleLength)}`;
}

/** 자격번호도 같은 규칙으로 가린다. 규칙이 달라지면 여기만 바꾼다. */
export const maskCredentialNumber = maskValue;

export function getCredentialValidityStatus(
  credential: Pick<Credential, "permanent" | "expiresAt">,
  now: Date = new Date(),
): CredentialValidityStatus {
  if (credential.permanent) {
    return "영구";
  }

  if (!credential.expiresAt) {
    return "만료일미입력";
  }

  const remainingDays = getDaysUntil(credential.expiresAt, now);

  if (remainingDays < 0) {
    return "만료됨";
  }

  return remainingDays <= EXPIRY_WARNING_DAYS ? "만료임박" : "유효";
}

export function getRemainingDays(credential: Pick<Credential, "expiresAt">, now: Date = new Date()): number | null {
  return credential.expiresAt ? getDaysUntil(credential.expiresAt, now) : null;
}

/** 한국 시간대 기준으로 표시한다. 날짜 라이브러리 없이 Intl만 쓴다. */
export function formatCredentialDate(value: Date | null): string {
  if (!value) {
    return "미입력";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(value);
}

/** <input type="date"> 에 넣을 값. 한국 시간대 기준 날짜를 그대로 쓴다. */
export function toDateInputValue(value: Date | null): string {
  if (!value) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(value);

  return parts;
}

function matchesValidityFilter(
  status: CredentialValidityStatus,
  filter: CredentialValidityFilter,
): boolean {
  if (filter === "전체") {
    return true;
  }

  if (filter === "영구") {
    return status === "영구";
  }

  if (filter === "만료") {
    return status === "만료됨";
  }

  return status === "유효" || status === "만료임박";
}

export function filterCredentials(
  credentials: Credential[],
  searchQuery: string,
  typeFilter: CredentialType | "전체",
  validityFilter: CredentialValidityFilter,
  now: Date = new Date(),
): Credential[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return credentials.filter((credential) => {
    // 자격번호는 검색 대상에서 제외한다. 검색어로 번호를 역추적할 수 있으면 안 된다.
    const matchesSearch =
      !normalizedQuery ||
      credential.name.toLowerCase().includes(normalizedQuery) ||
      credential.issuer.toLowerCase().includes(normalizedQuery) ||
      credential.grade.toLowerCase().includes(normalizedQuery) ||
      credential.score.toLowerCase().includes(normalizedQuery);

    const matchesType = typeFilter === "전체" || credential.credentialType === typeFilter;
    const status = getCredentialValidityStatus(credential, now);

    return matchesSearch && matchesType && matchesValidityFilter(status, validityFilter);
  });
}

export function sortCredentials(
  credentials: Credential[],
  sortKey: CredentialSortKey,
): Credential[] {
  return [...credentials].sort((first, second) => {
    if (sortKey === "nameAsc") {
      return first.name.localeCompare(second.name, "ko-KR");
    }

    if (sortKey === "acquiredDesc") {
      return second.acquiredAt.getTime() - first.acquiredAt.getTime();
    }

    // 만료 임박순. 만료일이 없는 자격(영구 포함)은 항상 뒤로 보낸다.
    const firstTime = first.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
    const secondTime = second.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;

    return firstTime - secondTime;
  });
}
