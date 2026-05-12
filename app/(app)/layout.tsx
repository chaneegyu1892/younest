import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/");
  if (user.status === "pending") redirect("/pending");
  if (user.status === "rejected" || user.status === "banned") redirect("/rejected");

  return (
    <div className="flex min-h-screen bg-background">
      {/* 사이드바는 Phase 5에서 추가 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
