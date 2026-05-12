import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarMobile } from "@/components/layout/SidebarMobile";

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
      <Sidebar userName={user.nickname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-surface p-2 md:hidden">
          <SidebarMobile userName={user.nickname} />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
