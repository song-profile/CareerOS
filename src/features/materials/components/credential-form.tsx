"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EMPTY_CREDENTIAL_FORM_VALUES } from "@/features/materials/form-defaults";
import {
  hasCredentialFormErrors,
  validateCredentialForm,
} from "@/features/materials/form-validation";
import { saveCredential } from "@/features/materials/materials-service";
import {
  CREDENTIAL_DESCRIPTION_MAX_LENGTH,
  CREDENTIAL_MEMO_MAX_LENGTH,
  type CredentialFormErrors,
  type CredentialFormValues,
  type CredentialType,
} from "@/features/materials/types";

const CREDENTIAL_TYPE_OPTIONS: { label: string; value: CredentialType }[] = [
  { label: "자격증", value: "자격증" },
  { label: "어학", value: "어학" },
  { label: "수상", value: "수상" },
  { label: "교육", value: "교육" },
  { label: "기타", value: "기타" },
];

interface CredentialFormProps {
  mode: "create" | "edit";
  credentialId?: string;
  initialValues?: CredentialFormValues;
}

export function CredentialForm({ credentialId, initialValues, mode }: CredentialFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CredentialFormValues>(initialValues ?? EMPTY_CREDENTIAL_FORM_VALUES);
  const [errors, setErrors] = useState<CredentialFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const acquiredAtRef = useRef<HTMLInputElement>(null);

  function updateValue<TKey extends keyof CredentialFormValues>(
    field: TKey,
    value: CredentialFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function focusFirstError(nextErrors: CredentialFormErrors) {
    if (nextErrors.credentialType) {
      typeRef.current?.focus();
      return;
    }
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.acquiredAt) {
      acquiredAtRef.current?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFailed(false);

    const nextErrors = validateCredentialForm(values);
    setErrors(nextErrors);

    if (hasCredentialFormErrors(nextErrors)) {
      focusFirstError(nextErrors);
      return;
    }

    setSaving(true);
    const result = await saveCredential(credentialId ?? null, values);
    setSaving(false);

    if (!result.ok) {
      // 실패해도 입력값은 그대로 둔다.
      setFailed(true);
      setMessage(result.message);
      return;
    }

    setMessage(mode === "create" ? "자격 정보를 저장했습니다." : "수정 내용을 저장했습니다.");
    router.push(`/materials/credentials/${result.value.id}`);
    router.refresh();
  }

  return (
    <Card className="max-w-3xl">
      <CardContent>
        <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              ref={typeRef}
              errorMessage={errors.credentialType}
              label="자격 구분"
              onChange={(event) =>
                updateValue("credentialType", event.target.value as CredentialType)
              }
              options={CREDENTIAL_TYPE_OPTIONS}
              placeholder="선택하세요"
              required
              value={values.credentialType}
            />
            <Input
              ref={nameRef}
              errorMessage={errors.name}
              label="자격명"
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="예: SQLD"
              required
              value={values.name}
            />
            <Input
              label="발급기관"
              onChange={(event) => updateValue("issuer", event.target.value)}
              placeholder="예: 한국데이터산업진흥원"
              value={values.issuer}
            />
            <Input
              ref={acquiredAtRef}
              errorMessage={errors.acquiredAt}
              label="취득일"
              onChange={(event) => updateValue("acquiredAt", event.target.value)}
              required
              type="date"
              value={values.acquiredAt}
            />
            <Input
              helperText="저장 후에는 목록과 상세에서 가려진 상태로 표시됩니다."
              label="자격번호"
              onChange={(event) => updateValue("credentialNumber", event.target.value)}
              value={values.credentialNumber}
            />
            <Input
              label="점수"
              onChange={(event) => updateValue("score", event.target.value)}
              placeholder="예: 845"
              value={values.score}
            />
            <Input
              label="등급"
              onChange={(event) => updateValue("grade", event.target.value)}
              placeholder="예: 합격, IM2"
              value={values.grade}
            />
            <Input
              errorMessage={errors.validFrom}
              label="유효기간 시작일"
              onChange={(event) => updateValue("validFrom", event.target.value)}
              type="date"
              value={values.validFrom}
            />
          </div>

          <div className="grid gap-3 rounded-card border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex items-start gap-2 text-body text-neutral-900">
              <input
                checked={values.permanent}
                className="mt-0.5 h-4 w-4 rounded border-neutral-200 text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                onChange={(event) => {
                  updateValue("permanent", event.target.checked);
                  if (event.target.checked) {
                    updateValue("expiresAt", "");
                  }
                }}
                type="checkbox"
              />
              <span>
                영구 자격입니다
                <span className="block text-caption text-neutral-600">
                  체크하면 만료일을 입력하지 않습니다.
                </span>
              </span>
            </label>

            {values.permanent ? null : (
              <Input
                errorMessage={errors.expiresAt}
                helperText="만료일이 없는 자격은 비워 둘 수 있습니다."
                label="만료일"
                onChange={(event) => updateValue("expiresAt", event.target.value)}
                type="date"
                value={values.expiresAt}
              />
            )}
          </div>

          <Textarea
            errorMessage={errors.description}
            helperText={`이 자격이 무엇을 검증하는지 직접 적습니다. (${values.description.length}/${CREDENTIAL_DESCRIPTION_MAX_LENGTH})`}
            label="자격 설명"
            onChange={(event) => updateValue("description", event.target.value)}
            rows={3}
            value={values.description}
          />

          <Textarea
            errorMessage={errors.usageMemo}
            helperText={`지원서에서 어떻게 활용할지 적습니다. (${values.usageMemo.length}/${CREDENTIAL_MEMO_MAX_LENGTH})`}
            label="내 활용 메모"
            onChange={(event) => updateValue("usageMemo", event.target.value)}
            rows={3}
            value={values.usageMemo}
          />

          <Textarea
            errorMessage={errors.studyMemo}
            helperText={`면접에서 말할 개인 기록입니다. (${values.studyMemo.length}/${CREDENTIAL_MEMO_MAX_LENGTH})`}
            label="취득 후기·공부 내용"
            onChange={(event) => updateValue("studyMemo", event.target.value)}
            rows={3}
            value={values.studyMemo}
          />

          <Input
            errorMessage={errors.referenceUrl}
            label="관련 URL"
            onChange={(event) => updateValue("referenceUrl", event.target.value)}
            placeholder="https://"
            type="url"
            value={values.referenceUrl}
          />

          <div className="grid gap-2 rounded-card border border-neutral-200 p-4">
            <p className="text-body-medium text-neutral-900">증빙 파일</p>
            <p className="text-body text-neutral-600">
              등록된 증빙 파일이 없습니다. 파일 보관함에서 등록한 뒤 이 자격에 연결할 수 있습니다.
            </p>
          </div>

          <p
            aria-live="polite"
            className={`min-h-5 text-caption ${failed ? "text-danger-600" : "text-success-700"}`}
            role="status"
          >
            {message}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-fit"
              onClick={() => router.back()}
              type="button"
              variant="secondary"
            >
              취소
            </Button>
            <Button className="w-full sm:w-fit" loading={saving} type="submit">
              저장
            </Button>
          </div>

          <LinkButton
            className="w-full sm:w-fit"
            href="/materials/credentials"
            size="sm"
            variant="ghost"
          >
            목록으로 돌아가기
          </LinkButton>
        </form>
      </CardContent>
    </Card>
  );
}
