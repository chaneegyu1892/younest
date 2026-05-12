"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function KakaoLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${origin}/auth/callback`,
        // 카카오 개인 앱은 account_email 권한이 없음 (비즈 앱 전환 시 가능).
        // Supabase 기본 scope("profile_nickname account_email")를 닉네임만으로 명시 override.
        scopes: "profile_nickname",
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
    // 성공 시 카카오로 자동 리다이렉트되므로 loading 유지
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-md bg-[#FEE500] px-4 py-3 text-body font-medium text-[#191919] hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "이동 중..." : "카카오로 시작하기"}
      </button>
      {error && (
        <p className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
