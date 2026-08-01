import {
  CREDENTIAL_DESCRIPTION_MAX_LENGTH,
  CREDENTIAL_MEMO_MAX_LENGTH,
  type CredentialFormErrors,
  type CredentialFormValues,
} from "@/features/materials/types";

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function isValidDate(value: string): boolean {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
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

/**
 * 자격 등록·수정 검증.
 *
 * 자격번호는 형식을 강제하지 않는다. 발급기관마다 체계가 달라 임의 규칙을 넣으면
 * 정상 값이 막힌다. 검증 과정에서도 자격번호 값을 오류 메시지에 넣지 않는다.
 */
export function validateCredentialForm(
  values: CredentialFormValues,
  now: Date = new Date(),
): CredentialFormErrors {
  const errors: CredentialFormErrors = {};

  if (!values.credentialType) {
    errors.credentialType = "자격 구분을 선택하세요.";
  }

  if (isBlank(values.name)) {
    errors.name = "자격명을 입력하세요.";
  }

  if (!isValidDate(values.acquiredAt)) {
    errors.acquiredAt = "취득일을 선택하세요.";
  } else if (new Date(values.acquiredAt).getTime() > now.getTime()) {
    errors.acquiredAt = "취득일은 오늘 이후일 수 없습니다.";
  }

  // 영구 자격은 만료일을 쓰지 않는다.
  if (!values.permanent && values.expiresAt && !isValidDate(values.expiresAt)) {
    errors.expiresAt = "만료일 형식이 올바르지 않습니다.";
  }

  if (values.validFrom && !isValidDate(values.validFrom)) {
    errors.validFrom = "유효기간 시작일 형식이 올바르지 않습니다.";
  }

  if (
    !values.permanent &&
    isValidDate(values.validFrom) &&
    isValidDate(values.expiresAt) &&
    new Date(values.validFrom).getTime() > new Date(values.expiresAt).getTime()
  ) {
    errors.expiresAt = "만료일은 유효기간 시작일 이후여야 합니다.";
  }

  if (!isValidUrl(values.referenceUrl)) {
    errors.referenceUrl = "관련 URL은 http 또는 https 주소여야 합니다.";
  }

  if (values.description.length > CREDENTIAL_DESCRIPTION_MAX_LENGTH) {
    errors.description = `자격 설명은 ${CREDENTIAL_DESCRIPTION_MAX_LENGTH}자 이하로 입력하세요.`;
  }

  if (values.usageMemo.length > CREDENTIAL_MEMO_MAX_LENGTH) {
    errors.usageMemo = `내 활용 메모는 ${CREDENTIAL_MEMO_MAX_LENGTH}자 이하로 입력하세요.`;
  }

  if (values.studyMemo.length > CREDENTIAL_MEMO_MAX_LENGTH) {
    errors.studyMemo = `취득 후기는 ${CREDENTIAL_MEMO_MAX_LENGTH}자 이하로 입력하세요.`;
  }

  return errors;
}

export function hasCredentialFormErrors(errors: CredentialFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
