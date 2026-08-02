import { redirect } from "next/navigation";
import { getCurrentUserFromSession } from "@/features/auth/api/server-auth";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  const authState = await getCurrentUserFromSession();

  if (authState.status === "authenticated") {
    redirect("/dashboard");
  }

  if (authState.status === "error") {
    redirect("/login?error=session_check_failed");
  }

  redirect("/login?error=oauth_failed");
}
