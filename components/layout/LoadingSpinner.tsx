interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "불러오는 중..." }: LoadingSpinnerProps) {
  return (
    <div
      className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-12"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        aria-hidden
      />
      <p className="text-caption text-text-secondary">{label}</p>
    </div>
  );
}
