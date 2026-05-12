import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-h1 font-semibold">404</h1>
      <p className="mt-2 text-text-secondary">길을 잃었어요</p>
      <Link href="/" className="mt-4 text-primary underline">
        홈으로
      </Link>
    </main>
  );
}
