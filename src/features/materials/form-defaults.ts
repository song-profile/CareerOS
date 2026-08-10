import { toDateInputValue } from "@/features/materials/credential-utils";
import type { CredentialDetail, CredentialFormValues } from "@/features/materials/types";

export const EMPTY_CREDENTIAL_FORM_VALUES: CredentialFormValues = {
  credentialType: "",
  name: "",
  issuer: "",
  acquiredAt: "",
  credentialNumber: "",
  score: "",
  grade: "",
  validFrom: "",
  expiresAt: "",
  permanent: false,
  description: "",
  usageMemo: "",
  studyMemo: "",
  referenceUrl: "",
};

/**
 * 서버 컴포넌트에서도 호출하므로 클라이언트 전용 파일에 두지 않는다.
 *
 * 자격번호는 credential에서 꺼내지 않는다 — 목록·상세 응답의 값은 마스킹된 값이라
 * 그대로 폼에 채우면 저장 시 마스킹 값이 원본을 덮어쓴다. 평문은 /number로 따로
 * 받아 credentialNumber 인자로 넘긴다. 넘기지 않으면 빈 값으로 둔다.
 */
export function toCredentialFormValues(
  credential: CredentialDetail,
  credentialNumber = "",
): CredentialFormValues {
  return {
    credentialType: credential.credentialType,
    name: credential.name,
    issuer: credential.issuer,
    acquiredAt: toDateInputValue(credential.acquiredAt),
    credentialNumber,
    score: credential.score,
    grade: credential.grade,
    validFrom: toDateInputValue(credential.validFrom),
    expiresAt: toDateInputValue(credential.expiresAt),
    permanent: credential.permanent,
    description: credential.description,
    usageMemo: credential.usageMemo,
    studyMemo: credential.studyMemo,
    referenceUrl: credential.referenceUrl,
  };
}
