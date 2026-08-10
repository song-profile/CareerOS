"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { ProfileSummaryCard } from "@/features/materials/components/profile-summary-card";
import { saveUserProfile } from "@/features/materials/materials-service";
import { toUserProfileFormValues } from "@/features/materials/api/mapper";
import type {
  GraduationStatus,
  MilitaryStatus,
  UserProfile,
  UserProfileFormErrors,
  UserProfileFormValues,
} from "@/features/materials/types";

const graduationStatusOptions = [
  { label: "재학", value: "재학" },
  { label: "졸업", value: "졸업" },
  { label: "졸업예정", value: "졸업예정" },
  { label: "휴학", value: "휴학" },
  { label: "수료", value: "수료" },
  { label: "기타", value: "기타" },
];

const militaryStatusOptions = [
  { label: "해당없음", value: "해당없음" },
  { label: "미필", value: "미필" },
  { label: "복무중", value: "복무중" },
  { label: "군필", value: "군필" },
  { label: "면제", value: "면제" },
  { label: "기타", value: "기타" },
];

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [values, setValues] = useState<UserProfileFormValues>(() =>
    toUserProfileFormValues(profile),
  );
  const [errors, setErrors] = useState<UserProfileFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const hasSavedValues = useMemo(
    () => Object.values(values).some((value) => value.trim().length > 0),
    [values],
  );

  function updateField<TKey extends keyof UserProfileFormValues>(
    key: TKey,
    value: UserProfileFormValues[TKey],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateProfile(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setToast({ tone: "error", message: "입력값을 확인해 주세요." });
      return;
    }

    setIsSaving(true);
    setToast(null);
    const result = await saveUserProfile(
      { name: currentProfile.name, email: currentProfile.email },
      values,
    );
    setIsSaving(false);

    if (result.ok) {
      setCurrentProfile(result.value);
      setValues(toUserProfileFormValues(result.value));
      setToast({ tone: "success", message: "기본정보를 저장했습니다." });
      return;
    }

    setToast({ tone: "error", message: result.message });
  }

  return (
    <div className="grid gap-6" aria-busy={isSaving || undefined}>
      <ProfileSummaryCard profile={currentProfile} />

      <Card>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-1">
              <h2 className="text-h3 text-neutral-900">기본정보 수정</h2>
              <p className="text-body text-neutral-600">
                한 번 저장한 정보는 지원서 작성과 제출 자료 정리에 반복해서 사용할 수 있습니다.
              </p>
              {!hasSavedValues ? (
                <p className="text-caption text-neutral-600" role="status">
                  아직 저장된 기본정보가 없습니다. 필요한 항목부터 채워주세요.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="이름" value={currentProfile.name} disabled />
              <Input label="이메일" value={currentProfile.email} disabled />
              <Input
                errorMessage={errors.phone}
                label="전화번호"
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="010-1234-5678"
                value={values.phone}
              />
              <Input
                label="주소"
                onChange={(event) => updateField("address", event.target.value)}
                placeholder="서울시 강남구"
                value={values.address}
              />
              <Input
                errorMessage={errors.schoolName}
                label="학교"
                onChange={(event) => updateField("schoolName", event.target.value)}
                value={values.schoolName}
              />
              <Input
                errorMessage={errors.major}
                label="주전공"
                onChange={(event) => updateField("major", event.target.value)}
                value={values.major}
              />
              <Input
                label="복수전공"
                onChange={(event) => updateField("doubleMajor", event.target.value)}
                value={values.doubleMajor}
              />
              <Input
                label="부전공"
                onChange={(event) => updateField("minor", event.target.value)}
                value={values.minor}
              />
              <Select
                label="졸업상태"
                onChange={(event) =>
                  updateField("graduationStatus", event.target.value as GraduationStatus | "")
                }
                options={graduationStatusOptions}
                placeholder="선택"
                value={values.graduationStatus}
              />
              <Input
                label="졸업일"
                onChange={(event) => updateField("graduationDate", event.target.value)}
                type="date"
                value={values.graduationDate}
              />
              <Input
                errorMessage={errors.gpa}
                inputMode="decimal"
                label="학점"
                onChange={(event) => updateField("gpa", event.target.value)}
                placeholder="4.12"
                value={values.gpa}
              />
              <Input
                errorMessage={errors.gpaScale}
                inputMode="decimal"
                label="학점 만점"
                onChange={(event) => updateField("gpaScale", event.target.value)}
                placeholder="4.5"
                value={values.gpaScale}
              />
              <Select
                label="병역상태"
                onChange={(event) =>
                  updateField("militaryStatus", event.target.value as MilitaryStatus | "")
                }
                options={militaryStatusOptions}
                placeholder="선택"
                value={values.militaryStatus}
              />
              <Input
                label="군별"
                onChange={(event) => updateField("militaryBranch", event.target.value)}
                placeholder="육군"
                value={values.militaryBranch}
              />
              <Input
                label="계급"
                onChange={(event) => updateField("militaryRank", event.target.value)}
                placeholder="병장"
                value={values.militaryRank}
              />
              <Input
                label="전역일"
                onChange={(event) => updateField("militaryDischargeDate", event.target.value)}
                type="date"
                value={values.militaryDischargeDate}
              />
            </div>

            <Textarea
              errorMessage={errors.careerSummary}
              label="경력요약"
              maxLength={1000}
              onChange={(event) => updateField("careerSummary", event.target.value)}
              placeholder="인턴, 프로젝트, 대외활동 등 지원서에 반복해서 쓰는 요약을 적어두세요."
              rows={5}
              value={values.careerSummary}
            />

            <div className="flex justify-end">
              <Button className="w-full sm:w-fit" loading={isSaving} type="submit">
                저장
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {toast ? <Toast tone={toast.tone}>{toast.message}</Toast> : null}
    </div>
  );
}

function validateProfile(values: UserProfileFormValues): UserProfileFormErrors {
  const errors: UserProfileFormErrors = {};
  const phone = values.phone.trim();
  const gpa = values.gpa.trim();
  const gpaScale = values.gpaScale.trim();

  if (phone && !/^[0-9+()\s-]{1,30}$/.test(phone)) {
    errors.phone = "전화번호 형식을 확인해 주세요.";
  }

  if (values.schoolName.length > 150) {
    errors.schoolName = "학교명은 150자 이하여야 합니다.";
  }

  if (values.major.length > 150) {
    errors.major = "전공은 150자 이하여야 합니다.";
  }

  if (gpa && !isNumberInRange(gpa, 0, 5)) {
    errors.gpa = "학점은 0 이상 5.0 이하여야 합니다.";
  }

  if (gpaScale && !isNumberInRange(gpaScale, 0.1, 5)) {
    errors.gpaScale = "학점 만점은 0보다 크고 5.0 이하여야 합니다.";
  }

  if (gpa && gpaScale && Number(gpa) > Number(gpaScale)) {
    errors.gpa = "학점은 학점 만점보다 클 수 없습니다.";
  }

  if (values.careerSummary.length > 1000) {
    errors.careerSummary = "경력요약은 1000자 이하여야 합니다.";
  }

  return errors;
}

function isNumberInRange(value: string, min: number, max: number): boolean {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
}
