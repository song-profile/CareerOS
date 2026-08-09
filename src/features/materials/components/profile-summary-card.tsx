import { Card, CardContent } from "@/components/ui/card";
import { CopyField } from "@/components/ui/copy-field";
import { LinkButton } from "@/components/ui/link-button";
import { MaskedField } from "@/components/ui/masked-field";
import { maskValue } from "@/features/materials/credential-utils";
import { toProfileFields } from "@/features/materials/profile-utils";
import type { UserProfile } from "@/features/materials/types";

interface ProfileSummaryCardProps {
  profile: UserProfile;
  /** 개요 화면에서는 자주 쓰는 항목만 보여주고 전체는 상세로 넘긴다. */
  compact?: boolean;
}

export function ProfileSummaryCard({ compact = false, profile }: ProfileSummaryCardProps) {
  const fields = toProfileFields(profile);
  const visibleFields = compact ? fields.slice(0, 4) : fields;
  const filledCount = fields.filter((field) => field.value.trim().length > 0).length;

  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h3 text-neutral-900">기본정보</h2>
            <span className="text-caption text-neutral-600">
              {filledCount} / {fields.length}개 입력됨
            </span>
          </div>

          <div className="divide-y divide-neutral-200">
            {visibleFields.map((field) =>
              field.sensitive ? (
                <MaskedField
                  key={field.key}
                  label={field.label}
                  maskedValue={maskValue(field.value)}
                  value={field.value}
                />
              ) : (
                <CopyField key={field.key} label={field.label} value={field.value} />
              ),
            )}
          </div>

          {compact ? (
            <div className="border-t border-neutral-200 pt-3">
              <LinkButton
                className="w-full sm:w-fit"
                href="/materials/profile"
                size="sm"
                variant="secondary"
              >
                기본정보 전체 보기
              </LinkButton>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
