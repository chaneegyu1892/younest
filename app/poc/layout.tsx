import { notFound } from "next/navigation";

export default function PocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // production 빌드에서는 PoC 경로 비활성화 (404)
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return (
    <main className="min-h-screen bg-background p-6">{children}</main>
  );
}
