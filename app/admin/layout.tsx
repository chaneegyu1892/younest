import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">{children}</main>
    </div>
  );
}
