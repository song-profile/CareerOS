import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CredentialValidityBadge } from "@/features/materials/components/credential-validity-badge";
import {
  MaterialsEmptyState,
  MaterialsErrorState,
} from "@/features/materials/components/materials-states";
import { ProfileSummaryCard } from "@/features/materials/components/profile-summary-card";
import {
  formatCredentialDate,
  getCredentialValidityStatus,
  sortCredentials,
} from "@/features/materials/credential-utils";
import {
  getCredentialsForCurrentUser,
  getUserProfileForCurrentUser,
} from "@/features/materials/api/server-materials-api";

export default async function MaterialsPage() {
  const [profileResult, credentialsResult] = await Promise.all([
    getUserProfileForCurrentUser(),
    getCredentialsForCurrentUser(),
  ]);

  const credentials = credentialsResult.ok ? credentialsResult.value : [];
  const expiring = sortCredentials(
    credentials.filter((credential) => {
      const status = getCredentialValidityStatus(credential);
      return status === "만료임박" || status === "만료됨";
    }),
    "expiresSoon",
  );

  return (
    <>
      <PageHeader
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/materials/files" size="sm" variant="secondary">
              파일 보관함
            </LinkButton>
            <LinkButton href="/materials/links" size="sm" variant="secondary">
              외부 링크
            </LinkButton>
            <LinkButton href="/materials/credentials/new" size="sm">
              자격 등록
            </LinkButton>
          </div>
        }
        description="지원서를 쓸 때 반복해서 필요한 값을 한곳에서 확인하고 복사하세요."
        title="내 취업자료"
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {profileResult.ok ? (
          <ProfileSummaryCard compact profile={profileResult.value} />
        ) : (
          <MaterialsErrorState title="기본정보를 불러올 수 없습니다." />
        )}

        <div className="grid gap-4">
          {credentialsResult.ok ? (
            <Card>
              <CardContent>
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-h3 text-neutral-900">자격증·어학</h2>
                    <span className="text-caption text-neutral-600">{credentials.length}개</span>
                  </div>

                  {credentials.length === 0 ? (
                    <p className="text-body text-neutral-600">아직 등록한 자격이 없습니다.</p>
                  ) : (
                    <ul className="grid gap-2">
                      {sortCredentials(credentials, "expiresSoon")
                        .slice(0, 3)
                        .map((credential) => (
                          <li
                            className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2 last:border-0 last:pb-0"
                            key={credential.id}
                          >
                            <span className="min-w-0 break-words text-body text-neutral-900">
                              {credential.name}
                            </span>
                            <CredentialValidityBadge credential={credential} />
                          </li>
                        ))}
                    </ul>
                  )}

                  <LinkButton
                    className="w-full sm:w-fit"
                    href="/materials/credentials"
                    size="sm"
                    variant="secondary"
                  >
                    자격증·어학 전체 보기
                  </LinkButton>
                </div>
              </CardContent>
            </Card>
          ) : (
            <MaterialsErrorState title="자격 정보를 불러올 수 없습니다." />
          )}

          <Card>
            <CardContent>
              <div className="grid gap-3">
                <h2 className="text-h3 text-neutral-900">만료 예정 자료</h2>
                {expiring.length === 0 ? (
                  <p className="text-body text-neutral-600">
                    30일 안에 만료되는 자료가 없습니다.
                  </p>
                ) : (
                  <ul className="grid gap-2">
                    {expiring.map((credential) => (
                      <li className="grid gap-1" key={credential.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="min-w-0 break-words text-body text-neutral-900">
                            {credential.name}
                          </span>
                          <CredentialValidityBadge credential={credential} />
                        </div>
                        <span className="font-mono text-mono text-neutral-600">
                          만료 {formatCredentialDate(credential.expiresAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <MaterialsEmptyState
          actionHref="/materials/files"
          actionLabel="파일 보관함 열기"
          description="증명사진, 성적증명서, 포트폴리오를 보관하는 영역입니다."
          title="등록된 파일이 없습니다."
        />
        <MaterialsEmptyState
          actionHref="/materials/links"
          actionLabel="외부 링크 열기"
          description="GitHub, Notion, 블로그 주소를 모아두는 영역입니다."
          title="등록된 외부 링크가 없습니다."
        />
      </div>
    </>
  );
}
