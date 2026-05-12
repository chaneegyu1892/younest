import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-md bg-surface p-8 shadow-card">
        <h1 className="text-display font-bold text-primary">younest</h1>
        <p className="mt-2 text-text-secondary">너만의 디지털 둥지</p>
        <Button className="mt-6" disabled>
          카카오로 시작하기 (M1에서 구현)
        </Button>
      </div>
    </main>
  );
}
