import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user?.status === "approved") redirect("/dashboard");

  return <div className="min-h-screen bg-background">{children}</div>;
}
