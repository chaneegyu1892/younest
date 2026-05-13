import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getSessionUser } from "@/lib/auth/session";
import { fetchUserPages } from "@/lib/supabase/queries/pages";
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

  const pages = await fetchUserPages();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.nickname} pages={pages} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-surface p-2 md:hidden">
          <SidebarMobile userName={user.nickname} pages={pages} />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}
