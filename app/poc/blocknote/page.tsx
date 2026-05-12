import PocLoader from "./PocLoader";

export default function BlocknotePocPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">BlockNote PoC</h1>
      <p className="mt-2 text-sm text-text-secondary">
        M0 검증 페이지 — production 빌드에서는 404
      </p>
      <div className="mt-6 rounded-md border border-border bg-background p-4">
        <PocLoader />
      </div>
    </div>
  );
}
