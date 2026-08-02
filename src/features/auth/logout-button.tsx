"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/api/auth-api";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await logout();
      router.replace("/login?loggedOut=1");
      router.refresh();
    } catch {
      setErrorMessage("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button className="w-full" loading={loading} onClick={handleLogout} size="sm" variant="ghost">
        로그아웃
      </Button>
      {errorMessage ? <p className="text-caption text-danger-700">{errorMessage}</p> : null}
    </div>
  );
}
