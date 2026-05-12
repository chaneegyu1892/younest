export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 사이드바는 Phase 5에서 추가, 가드는 Phase 3에서 추가 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
