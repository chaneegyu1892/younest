const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "always" });
const dtf = new Intl.DateTimeFormat("ko", { dateStyle: "medium" });

/**
 * ISO 시간을 한국어 상대 표현으로 변환.
 * - < 60초: "방금 전"
 * - < 60분: "N분 전"
 * - < 24시간: "N시간 전"
 * - < 7일: "N일 전"
 * - < 4주: "N주 전"
 * - 그 외: 절대 날짜 (예: "2026. 5. 14.")
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diff = now.getTime() - then;

  if (diff < MINUTE) return "방금 전";
  if (diff < HOUR) return rtf.format(-Math.floor(diff / MINUTE), "minute");
  if (diff < DAY) return rtf.format(-Math.floor(diff / HOUR), "hour");
  if (diff < WEEK) return rtf.format(-Math.floor(diff / DAY), "day");
  if (diff < 4 * WEEK) return rtf.format(-Math.floor(diff / WEEK), "week");
  return dtf.format(new Date(iso));
}
