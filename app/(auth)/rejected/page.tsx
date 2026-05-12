import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function RejectedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  // 만약 다시 approved 상태로 바뀌면 이 페이지에 머물 이유 없음
  if (user.status === "approved") redirect("/dashboard");
  if (user.status === "pending") redirect(user.nickname ? "/pending" : "/signup");

  const isBanned = user.status === "banned";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md bg-surface p-8 text-center shadow-card">
        <div className="text-display">🚪</div>
        <h1 className="mt-2 text-h1 font-semibold text-text-primary">
          {isBanned ? "이용이 제한되었어요" : "가입이 거절되었어요"}
        </h1>
        <p className="mt-3 text-body text-text-secondary">
          {isBanned
            ? "운영 정책 위반으로 접근이 차단됐어요."
            : "문의가 있으시면 운영자에게 연락 부탁드려요."}
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
