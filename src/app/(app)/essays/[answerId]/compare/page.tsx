import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EssayVersionCompare } from "@/features/essays/components/essay-version-compare";
import {
  VersionCompareEmptyState,
  VersionCompareErrorState,
} from "@/features/essays/components/version-states";
import {
  fetchEssayAnswerForCurrentUser,
  fetchEssayVersionsForCurrentUser,
} from "@/features/essays/api/server-essay-api";
import { getDefaultComparePair } from "@/features/essays/version-utils";

interface ComparePageProps {
  params: Promise<{ answerId: string }>;
  searchParams: Promise<{ left?: string; right?: string }>;
}

export default async function EssayVersionComparePage({
  params,
  searchParams,
}: ComparePageProps) {
  const { answerId } = await params;
  const answerResult = await fetchEssayAnswerForCurrentUser(answerId);

  if (!answerResult.ok) {
    notFound();
  }

  const answer = answerResult.value;

  const header = (
    <PageHeader
      description={`${answer.question.companyName} · ${answer.question.positionName} · ${answer.question.questionOrder}번 문항`}
      title="버전 비교"
    />
  );

  const versionsResult = await fetchEssayVersionsForCurrentUser(answerId);

  if (!versionsResult.ok) {
    return (
      <>
        {header}
        <VersionCompareErrorState answerGroupId={answerId} />
      </>
    );
  }

  const versions = versionsResult.value;
  const defaultPair = getDefaultComparePair(versions);

  if (!defaultPair) {
    return (
      <>
        {header}
        <VersionCompareEmptyState answerGroupId={answerId} />
      </>
    );
  }

  const { left: leftParam, right: rightParam } = await searchParams;
  const left = versions.find((version) => version.versionId === leftParam) ?? defaultPair.left;
  const right = versions.find((version) => version.versionId === rightParam) ?? defaultPair.right;

  return (
    <>
      {header}
      <EssayVersionCompare
        answerGroupId={answerId}
        left={left}
        right={right}
        versions={versions}
      />
    </>
  );
}
