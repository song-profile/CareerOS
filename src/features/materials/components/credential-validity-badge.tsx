import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import {
  formatCredentialDate,
  getCredentialValidityStatus,
  getRemainingDays,
} from "@/features/materials/credential-utils";
import type { Credential, CredentialValidityStatus } from "@/features/materials/types";

const statusVariant: Record<CredentialValidityStatus, BadgeProps["variant"]> = {
  영구: "success",
  유효: "deadlineUpcoming",
  만료임박: "deadlineSoon",
  만료됨: "danger",
  만료일미입력: "neutral",
};

interface CredentialValidityBadgeProps {
  credential: Pick<Credential, "permanent" | "expiresAt">;
}

/** 색만으로 상태를 전달하지 않도록 상태명과 날짜를 항상 텍스트로 함께 노출한다. */
export function CredentialValidityBadge({ credential }: CredentialValidityBadgeProps) {
  const status = getCredentialValidityStatus(credential);
  const remainingDays = getRemainingDays(credential);

  const detail =
    status === "만료임박" && remainingDays !== null
      ? `${remainingDays}일 남음`
      : status === "만료됨"
        ? `${formatCredentialDate(credential.expiresAt)} 만료`
        : status === "유효"
          ? `${formatCredentialDate(credential.expiresAt)}까지`
          : "";

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge variant={statusVariant[status]}>
        {status === "만료일미입력" ? "만료일 미입력" : status}
      </Badge>
      {detail ? <span className="text-caption text-neutral-600">{detail}</span> : null}
    </span>
  );
}
