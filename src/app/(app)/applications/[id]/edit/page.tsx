import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { createApplicationFormValuesFromListItem } from "@/features/applications/form-defaults";
import { applicationMockData } from "@/features/applications/mock-data";

interface EditApplicationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const { id } = await params;
  const application = applicationMockData.find((item) => item.id === id);

  if (!application) {
    return (
      <>
        <PageHeader
          description="목 데이터에 없는 지원 건입니다. 목록에서 다시 선택하세요."
          title="지원 수정"
        />
        <Card>
          <CardContent>
            <div className="grid gap-3">
              <p className="text-body-medium text-neutral-900">지원 건을 찾을 수 없습니다.</p>
              <LinkButton className="w-full sm:w-fit" href="/applications" variant="secondary">
                지원 목록으로 돌아가기
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        description={`${application.companyName} / ${application.position} 지원 정보를 수정합니다.`}
        title="지원 수정"
      />
      <ApplicationForm
        initialValues={createApplicationFormValuesFromListItem(application)}
        mode="edit"
      />
    </>
  );
}
