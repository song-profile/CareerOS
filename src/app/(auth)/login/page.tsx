import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout description="저장한 지원 자료와 일정을 다시 확인하려면 로그인하세요." title="로그인">
      <LoginForm />
    </AuthLayout>
  );
}
