import { KakaoLoginButton } from "./KakaoLoginButton";

interface LandingPageProps {
  searchParams: Promise<{ auth_error?: string }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-md bg-surface p-8 shadow-card">
        <h1 className="text-display font-bold text-primary">younest</h1>
        <p className="mt-2 text-body text-text-secondary">
          너만의 디지털 둥지
        </p>

        {params.auth_error && (
          <p className="mt-4 rounded-md bg-error/10 px-3 py-2 text-caption text-error">
            로그인 실패: {params.auth_error}
          </p>
        )}

        <div className="mt-6">
          <KakaoLoginButton />
        </div>
      </div>
    </main>
  );
}
