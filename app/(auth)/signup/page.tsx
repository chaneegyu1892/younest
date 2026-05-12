import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { SignupForm } from "./SignupForm";

/**
 * 가입 신청 폼 페이지.
 *
 * 진입 조건:
 * - 카카오 OAuth 직후, users.nickname IS NULL (콜백에서 라우팅됨)
 *
 * 이탈 조건:
 * - 미로그인 → / (middleware)
 * - 이미 nickname 있고 status='pending' → /pending
 * - status='approved' → /dashboard ((auth) layout가 처리)
 * - status='rejected'|'banned' → /rejected
 */
export default async function SignupPage() {
  const user = await getSessionUser();

  if (!user) redirect("/");
  if (user.status === "rejected" || user.status === "banned") {
    redirect("/rejected");
  }
  if (user.nickname) {
    // 이미 폼 작성한 경우
    if (user.status === "approved") redirect("/dashboard");
    redirect("/pending");
  }

  // 어드민으로 자동 승인된 신규 사용자는 폼 제출 후 바로 대시보드로
  const redirectTarget = user.status === "approved" ? "/dashboard" : "/pending";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md bg-surface p-8 shadow-card">
        <h1 className="text-h1 font-semibold text-text-primary">가입 신청</h1>
        <p className="mt-2 text-body text-text-secondary">
          어드민 승인 후 시작할 수 있어요.
        </p>

        <div className="mt-6">
          <SignupForm redirectTarget={redirectTarget} />
        </div>
      </div>
    </main>
  );
}
