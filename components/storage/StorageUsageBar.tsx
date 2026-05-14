import React from "react";

interface StorageUsageBarProps {
  usedBytes: number;
  limitBytes: number;
}

const MB = 1024 * 1024;
const WARN_THRESHOLD = 0.9;

function formatMB(bytes: number): string {
  return (bytes / MB).toFixed(1);
}

/**
 * 스토리지 사용량 progress bar + 텍스트.
 * - 90% 이상 시 경고 색 (bg-warning, text-warning)
 */
export function StorageUsageBar({
  usedBytes,
  limitBytes,
}: StorageUsageBarProps) {
  const pct = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  const isWarn = usedBytes / limitBytes >= WARN_THRESHOLD;

  return (
    <div>
      <div className="flex items-baseline justify-between text-body">
        <span
          className={
            isWarn
              ? "text-warning font-medium"
              : "text-text-primary"
          }
        >
          {formatMB(usedBytes)} MB / {formatMB(limitBytes)} MB 사용 중
        </span>
        <span className="text-caption text-text-tertiary">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          style={{ width: `${pct}%` }}
          className={`h-full ${isWarn ? "bg-warning" : "bg-primary"}`}
        />
      </div>
    </div>
  );
}
