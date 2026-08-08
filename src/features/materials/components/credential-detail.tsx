import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CopyField } from "@/components/ui/copy-field";
import { LinkButton } from "@/components/ui/link-button";
import { CredentialDeleteButton } from "@/features/materials/components/credential-delete-button";
import { CredentialNumberField } from "@/features/materials/components/credential-number-field";
import { CredentialValidityBadge } from "@/features/materials/components/credential-validity-badge";
import {
  formatCredentialDate,
} from "@/features/materials/credential-utils";
import type { CredentialDetail } from "@/features/materials/types";

function MemoSection({ body, description, title }: { title: string; description: string; body: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="grid gap-0.5">
        <h3 className="text-h3 text-neutral-900">{title}</h3>
        <p className="text-caption text-neutral-400">{description}</p>
      </div>
      {body.trim() ? (
        <p className="whitespace-pre-wrap text-body leading-7 text-neutral-900">{body}</p>
      ) : (
        <p className="text-body text-neutral-400">아직 작성하지 않았습니다.</p>
      )}
    </div>
  );
}

/** 증빙 파일은 다음 단계에서 연결한다. 가짜 다운로드 동작은 만들지 않는다. */
function EvidenceFileSection({ fileName }: { fileName: string | null }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-h3 text-neutral-900">증빙 파일</h3>
      {fileName ? (
        <p className="break-all text-body text-neutral-900">{fileName}</p>
      ) : (
        <p className="text-body text-neutral-600">등록된 증빙 파일이 없습니다.</p>
      )}
    </div>
  );
}

function UsageHistoryList({ histories }: { histories: CredentialDetail["usageHistories"] }) {
  return (
    <div className="grid gap-2">
      <h3 className="text-h3 text-neutral-900">사용 이력</h3>
      {histories.length === 0 ? (
        <p className="text-body text-neutral-600">아직 이 자격을 사용한 지원 건이 없습니다.</p>
      ) : (
        <ul className="grid gap-2">
          {histories.map((history) => (
            <li key={history.id}>
              <LinkButton
                className="w-full justify-start sm:w-fit"
                href={`/applications/${history.applicationId}`}
                size="sm"
                variant="secondary"
              >
                {history.companyName} · {history.positionName}
              </LinkButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CredentialDetailViewProps {
  credential: CredentialDetail;
}

export function CredentialDetailView({ credential }: CredentialDetailViewProps) {
  return (
    <div className="grid max-w-3xl gap-4">
      <Card>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 grid gap-1">
                <h2 className="break-words text-h2 text-neutral-900">{credential.name}</h2>
                <p className="break-words text-body text-neutral-600">
                  {credential.issuer || "발급기관 미입력"}
                </p>
              </div>
              <Badge>{credential.credentialType}</Badge>
            </div>

            <CredentialValidityBadge credential={credential} />

            <div className="divide-y divide-neutral-200 border-t border-neutral-200 pt-1">
              <CopyField
                label="취득일"
                mono
                value={formatCredentialDate(credential.acquiredAt)}
              />
              <CredentialNumberField
                credentialId={credential.id}
                hasCredentialNumber={credential.hasCredentialNumber}
                maskedValue={credential.credentialNumber}
              />
              {credential.score ? <CopyField label="점수" mono value={credential.score} /> : null}
              {credential.grade ? <CopyField label="등급" value={credential.grade} /> : null}
              <CopyField
                label="유효기간 시작"
                mono
                value={formatCredentialDate(credential.validFrom)}
              />
              <CopyField
                label="만료일"
                mono
                value={credential.permanent ? "영구" : formatCredentialDate(credential.expiresAt)}
              />
              {credential.referenceUrl ? (
                <CopyField label="관련 URL" value={credential.referenceUrl} />
              ) : null}
            </div>

            <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 sm:flex-row">
              <LinkButton
                className="w-full sm:w-fit"
                href={`/materials/credentials/${credential.id}/edit`}
                size="sm"
              >
                수정
              </LinkButton>
              <LinkButton
                className="w-full sm:w-fit"
                href="/materials/credentials"
                size="sm"
                variant="secondary"
              >
                목록으로
              </LinkButton>
              <CredentialDeleteButton
                credentialId={credential.id}
                credentialName={credential.name}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid gap-5">
            <MemoSection
              body={credential.description}
              description="이 자격이 무엇을 검증하는지"
              title="자격 설명"
            />
            <MemoSection
              body={credential.usageMemo}
              description="지원서에서 어떻게 활용할지"
              title="내 활용 메모"
            />
            <MemoSection
              body={credential.studyMemo}
              description="면접에서 말할 개인 기록"
              title="취득 후기·공부 내용"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid gap-5">
            <EvidenceFileSection fileName={credential.evidenceFileName} />
            <UsageHistoryList histories={credential.usageHistories} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
