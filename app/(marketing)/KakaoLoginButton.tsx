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
