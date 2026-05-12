"use client";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-h1 font-semibold text-text-primary">
        문제가 발생했어요
      </h1>
      <p className="text-body text-text-secondary">
        잠시 후 다시 시도해주세요. 계속되면 새로고침해보세요.
      </p>
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-2 max-w-2xl overflow-auto rounded-md bg-sidebar p-4 text-caption text-text-secondary">
          {error.message}
          {error.digest && `\n\ndigest: ${error.digest}`}
        </pre>
      )}
      <Button onClick={reset} className="mt-2">
        다시 시도
      </Button>
    </main>
  );
}
