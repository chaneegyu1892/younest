"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-h1 font-semibold">문제가 발생했어요</h1>
      <p className="mt-2 text-text-secondary">잠시 후 다시 시도해주세요</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover"
      >
        다시 시도
      </button>
    </main>
  );
}
