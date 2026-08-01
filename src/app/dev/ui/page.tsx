import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardButton, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const buttonVariants = ["primary", "secondary", "ghost", "danger"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

export default function UiPreviewPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10 text-neutral-900">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <header className="grid gap-2">
          <p className="text-caption text-primary-600">CareerDock UI</p>
          <h1 className="text-h1">공통 컴포넌트 확인</h1>
        </header>

        <Card>
          <CardHeader>
            <h2 className="text-h2">Button</h2>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-3">
              {buttonVariants.map((variant) => (
                <div className="flex flex-wrap items-center gap-3" key={variant}>
                  {buttonSizes.map((size) => (
                    <Button key={`${variant}-${size}`} size={size} variant={variant}>
                      {variant} {size}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>disabled Button</Button>
              <Button loading>loading Button</Button>
              <Button leadingIcon={<span aria-hidden="true">+</span>}>icon Button</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h2">Input</h2>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Input
              helperText="지원 건 이름처럼 다시 찾을 수 있는 이름을 사용하세요."
              label="정상 Input"
              placeholder="KB국민은행 IT 개발"
            />
            <Input
              errorMessage="필수 항목입니다."
              label="에러 Input"
              placeholder="회사명"
              required
            />
            <Input disabled label="disabled Input" placeholder="수정할 수 없음" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h2">Textarea</h2>
          </CardHeader>
          <CardContent>
            <Textarea
              helperText="글자 수 카운터는 이후 자소서 에디터 단계에서 추가합니다."
              label="Textarea"
              placeholder="자소서 답변 초안을 입력하세요."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-h2">Badge</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>일반 Badge</Badge>
            <Badge variant="deadlineUrgent">오늘 마감</Badge>
            <Badge variant="deadlineSoon">D-3</Badge>
            <Badge variant="deadlineUpcoming">D-7</Badge>
            <Badge variant="statusDraft">작성 중</Badge>
            <Badge variant="statusSubmitted">지원 완료</Badge>
            <Badge variant="statusInterview">면접</Badge>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-h2">기본 Card</h2>
            </CardHeader>
            <CardContent>
              <p className="text-body text-neutral-600">
                그림자 대신 border로 구분하는 기본 카드입니다.
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-caption text-neutral-600">카드 하단 영역</p>
            </CardFooter>
          </Card>

          <Card variant="highlight">
            <CardHeader>
              <h2 className="text-h2">강조 Card</h2>
            </CardHeader>
            <CardContent>
              <p className="text-body text-neutral-600">
                중요한 안내나 다음 행동을 보여줄 때 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        <CardButton>
          <CardHeader>
            <h2 className="text-h2">클릭 가능 Card</h2>
          </CardHeader>
          <CardContent>
            <p className="text-body text-neutral-600">
              클릭 동작이 필요한 카드는 button 기반 구조를 사용합니다.
            </p>
          </CardContent>
        </CardButton>
      </div>
    </main>
  );
}
