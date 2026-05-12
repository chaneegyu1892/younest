import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

/**
 * 승인 대기 화면.
 * 가입 신청 후 어드민이 승인할 때까지 머무는 페이지.
 *
 * 이탈:
 * - 닉네임 미작성 → /signup
 * - approved → /dashboard ((auth) layout)
 * - rejected/banned → /rejected
 */
export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (!user.nickname) redirect("/signup");
  if (user.status === "rejected" || user.status === "banned") {
    redirect("/rejected");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md bg-surface p-8 text-center shadow-card">
        <div className="text-display">⏳</div>
        <h1 className="mt-2 text-h1 font-semibold text-text-primary">
          승인 대기 중
        </h1>
        <p className="mt-3 text-body text-text-secondary">
          <strong className="text-text-primary">{user.nickname}</strong>님,
          가입 신청이 접수됐어요.
        </p>
        <p className="mt-2 text-body text-text-secondary">
          어드민이 승인하면 알림 후 시작할 수 있어요.
        </p>

        <form action="/api/auth/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="text-caption text-text-tertiary underline hover:text-primary"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  );
}
