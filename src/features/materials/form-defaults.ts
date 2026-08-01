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

/** 서버 컴포넌트에서도 호출하므로 클라이언트 전용 파일에 두지 않는다. */
export function toCredentialFormValues(credential: CredentialDetail): CredentialFormValues {
  return {
    credentialType: credential.credentialType,
    name: credential.name,
    issuer: credential.issuer,
    acquiredAt: toDateInputValue(credential.acquiredAt),
    credentialNumber: credential.credentialNumber,
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
