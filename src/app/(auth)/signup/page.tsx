import { AuthLayout } from "@/components/layout/auth-layout";
import { SignupForm } from "@/features/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthLayout description="반복해서 찾는 취업 자료를 CareerDock에서 정리하세요." title="회원가입">
      <SignupForm />
    </AuthLayout>
  );
}
