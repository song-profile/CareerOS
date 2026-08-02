"use client";

import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS_OPTIONS, RECRUITMENT_SEASON_OPTIONS } from "@/features/applications/form-options";
import {
  APPLICATION_MEMO_MAX_LENGTH,
  type ApplicationFormErrors,
  type ApplicationFormValues,
} from "@/features/applications/form-types";
import {
  hasApplicationFormErrors,
  toApplicationSavePayload,
  validateApplicationForm,
} from "@/features/applications/form-validation";
import {
  createApplication,
  updateApplication,
} from "@/features/applications/api/application-api";
import { ApiClientError } from "@/lib/api/client";

interface ApplicationFormProps {
  applicationId?: string;
  mode: "create" | "edit";
  initialValues: ApplicationFormValues;
}

const successMessage = {
  create: "지원 건을 등록했습니다.",
  edit: "지원 건을 수정했습니다.",
};

export function ApplicationForm({ applicationId, initialValues, mode }: ApplicationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const companyNameRef = useRef<HTMLInputElement>(null);
  const positionRef = useRef<HTMLInputElement>(null);
  const recruitmentYearRef = useRef<HTMLInputElement>(null);
  const seasonRef = useRef<HTMLSelectElement>(null);
  const postingUrlRef = useRef<HTMLInputElement>(null);
  const workLocationRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);

  function updateValue(field: keyof ApplicationFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function focusFirstError(nextErrors: ApplicationFormErrors) {
    const fieldRefs = [
      { error: nextErrors.companyName, ref: companyNameRef },
      { error: nextErrors.position, ref: positionRef },
      { error: nextErrors.recruitmentYear, ref: recruitmentYearRef },
      { error: nextErrors.season, ref: seasonRef },
      { error: nextErrors.postingUrl, ref: postingUrlRef },
      { error: nextErrors.workLocation, ref: workLocationRef },
      { error: nextErrors.startDate, ref: startDateRef },
      { error: nextErrors.deadline, ref: deadlineRef },
      { error: nextErrors.status, ref: statusRef },
      { error: nextErrors.memo, ref: memoRef },
    ];

    fieldRefs.find((field) => field.error)?.ref.current?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setToastMessage("");
    setToastTone("success");

    const nextErrors = validateApplicationForm(values);
    setErrors(nextErrors);

    if (hasApplicationFormErrors(nextErrors)) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = toApplicationSavePayload(values);
      const savedApplication =
        mode === "create"
          ? await createApplication(payload)
          : await updateApplication(applicationId ?? "", payload);

      setToastTone("success");
      setToastMessage(successMessage[mode]);
      router.push(`/applications/${savedApplication.id}`);
      router.refresh();
    } catch (error) {
      setToastTone("error");
      setToastMessage(getApplicationSaveErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardContent>
          <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                errorMessage={errors.companyName}
                label="회사명"
                onChange={(event) => updateValue("companyName", event.target.value)}
                placeholder="회사명"
                ref={companyNameRef}
                required
                value={values.companyName}
              />
              <Input
                errorMessage={errors.position}
                label="직무명"
                onChange={(event) => updateValue("position", event.target.value)}
                placeholder="직무명"
                ref={positionRef}
                required
                value={values.position}
              />
              <Input
                errorMessage={errors.recruitmentYear}
                inputMode="numeric"
                label="채용연도"
                onChange={(event) => updateValue("recruitmentYear", event.target.value)}
                placeholder="2026"
                ref={recruitmentYearRef}
                required
                value={values.recruitmentYear}
              />
              <Select
                errorMessage={errors.season}
                label="채용시기"
                onChange={(event) => updateValue("season", event.target.value)}
                options={RECRUITMENT_SEASON_OPTIONS}
                placeholder="선택"
                ref={seasonRef}
                required
                value={values.season}
              />
              <Input
                errorMessage={errors.postingUrl}
                label="공고 URL"
                onChange={(event) => updateValue("postingUrl", event.target.value)}
                placeholder="https://example.com/job"
                ref={postingUrlRef}
                type="url"
                value={values.postingUrl}
              />
              <Input
                errorMessage={errors.workLocation}
                label="근무지역"
                onChange={(event) => updateValue("workLocation", event.target.value)}
                placeholder="서울"
                ref={workLocationRef}
                required
                value={values.workLocation}
              />
              <Input
                errorMessage={errors.startDate}
                label="지원 시작일"
                onChange={(event) => updateValue("startDate", event.target.value)}
                ref={startDateRef}
                required
                type="date"
                value={values.startDate}
              />
              <Input
                errorMessage={errors.deadline}
                label="지원 마감일"
                onChange={(event) => updateValue("deadline", event.target.value)}
                ref={deadlineRef}
                required
                type="datetime-local"
                value={values.deadline}
              />
              <Select
                errorMessage={errors.status}
                label="현재 상태"
                onChange={(event) => updateValue("status", event.target.value)}
                options={APPLICATION_STATUS_OPTIONS}
                placeholder="선택"
                ref={statusRef}
                required
                value={values.status}
              />
            </div>

            <Textarea
              errorMessage={errors.memo}
              helperText={`${values.memo.length}/${APPLICATION_MEMO_MAX_LENGTH}자`}
              label="메모"
              onChange={(event) => updateValue("memo", event.target.value)}
              placeholder="지원 준비 중 확인할 내용을 간단히 남기세요."
              ref={memoRef}
              resize="vertical"
              rows={5}
              value={values.memo}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <LinkButton className="w-full sm:w-auto" href="/applications" variant="secondary">
                취소
              </LinkButton>
              <Button className="w-full sm:w-auto" loading={submitting} type="submit">
                저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {toastMessage ? (
        <div
          className={
            toastTone === "success"
              ? "fixed bottom-6 left-6 right-6 z-50 rounded-card border border-success-100 bg-success-50 px-4 py-3 text-body-medium text-success-700 shadow-lg sm:left-auto sm:w-[360px]"
              : "fixed bottom-6 left-6 right-6 z-50 rounded-card border border-danger-100 bg-danger-50 px-4 py-3 text-body-medium text-danger-700 shadow-lg sm:left-auto sm:w-[360px]"
          }
          role="status"
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}

function getApplicationSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.kind === "validation") {
      return "입력값을 확인해 주세요.";
    }

    return error.message;
  }

  return "지원 건을 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.";
}
