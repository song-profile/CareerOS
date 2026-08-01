import { PageHeader } from "@/components/layout/page-header";
import { ApplicationForm } from "@/features/applications/components/application-form";
import { createEmptyApplicationFormValues } from "@/features/applications/form-defaults";

export default function NewApplicationPage() {
  return (
    <>
      <PageHeader
        description="회사와 직무, 일정 정보를 입력해 새 지원 건을 준비합니다."
        title="지원 등록"
      />
      <ApplicationForm initialValues={createEmptyApplicationFormValues()} mode="create" />
    </>
  );
}
