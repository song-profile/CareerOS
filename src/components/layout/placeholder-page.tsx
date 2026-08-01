import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader
        actions={
          <Button disabled size="sm" variant="secondary">
            다음 단계 예정
          </Button>
        }
        description={description}
        title={title}
      />
      <Card>
        <CardContent>
          <p className="text-body text-neutral-600">이 화면은 다음 단계에서 구현됩니다.</p>
        </CardContent>
      </Card>
    </>
  );
}
