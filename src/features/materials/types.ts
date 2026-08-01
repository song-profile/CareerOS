export type CredentialType = "자격증" | "어학" | "수상" | "교육" | "기타";

export type CredentialValidityStatus =
  | "영구"
  | "유효"
  | "만료임박"
  | "만료됨"
  | "만료일미입력";

/** 기본정보의 한 항목. 값이 없으면 "미입력"으로 표시한다. */
export interface ProfileField {
  key: string;
  label: string;
  value: string;
  /** 기본 마스킹이 필요한 값인지. 전화번호·주소처럼 민감도가 높은 항목에 쓴다. */
  sensitive: boolean;
  /** 지원서에 반복해서 넣는 값인지. 복사 버튼을 우선 노출한다. */
  copyable: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  school: string;
  major: string;
  doubleMajor: string;
  gpa: string;
  militaryService: string;
  careerSummary: string;
}

export interface Credential {
  id: string;
  credentialType: CredentialType;
  name: string;
  issuer: string;
  acquiredAt: Date;
  /** 원본 값. 화면에서는 항상 마스킹해서 시작한다. */
  credentialNumber: string;
  score: string;
  grade: string;
  validFrom: Date | null;
  expiresAt: Date | null;
  permanent: boolean;
  description: string;
  usageMemo: string;
  studyMemo: string;
  /** 증빙 파일은 다음 단계에서 연결한다. 지금은 연결 여부만 본다. */
  evidenceFileName: string | null;
  referenceUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 어떤 지원 건에서 이 자격을 썼는지. 연결 API가 없어 읽기 전용이다. */
export interface CredentialUsageHistory {
  id: string;
  companyName: string;
  positionName: string;
  applicationId: string;
}

export interface CredentialDetail extends Credential {
  usageHistories: CredentialUsageHistory[];
}

export interface CredentialFormValues {
  credentialType: CredentialType | "";
  name: string;
  issuer: string;
  acquiredAt: string;
  credentialNumber: string;
  score: string;
  grade: string;
  validFrom: string;
  expiresAt: string;
  permanent: boolean;
  description: string;
  usageMemo: string;
  studyMemo: string;
  referenceUrl: string;
}

export interface CredentialFormErrors {
  credentialType?: string;
  name?: string;
  issuer?: string;
  acquiredAt?: string;
  credentialNumber?: string;
  score?: string;
  grade?: string;
  validFrom?: string;
  expiresAt?: string;
  description?: string;
  usageMemo?: string;
  studyMemo?: string;
  referenceUrl?: string;
}

export type CredentialValidityFilter = "전체" | "유효" | "만료" | "영구";
export type CredentialSortKey = "expiresSoon" | "acquiredDesc" | "nameAsc";

export const CREDENTIAL_MEMO_MAX_LENGTH = 1000;
export const CREDENTIAL_DESCRIPTION_MAX_LENGTH = 500;
