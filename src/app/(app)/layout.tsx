import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";

interface AppLayoutProps {
  children: ReactNode;
}

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  const authState = await getCurrentUserFromSession();

  if (authState.status === "unauthenticated") {
    redirect("/login?error=login_required");
  }

  if (authState.status === "error") {
    redirect("/login?error=session_check_failed");
  }

  return <AppShell currentUser={authState.user}>{children}</AppShell>;
}
