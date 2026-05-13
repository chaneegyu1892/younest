const KEY = "younest:tree-expanded";

/**
 * SSR-safe localStorage 접근. 실패는 빈 Set으로 fallback.
 */
export function loadExpandedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

/**
 * 전개된 ID 세트를 localStorage에 저장.
 */
export function saveExpandedIds(ids: ReadonlySet<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // 사용 거부/할당량 초과 — 메모리 상태만 유효, silent fail
  }
}

/**
 * 전개 상태를 토글. 없으면 추가, 있으면 제거.
 */
export function toggleExpanded(
  current: ReadonlySet<string>,
  id: string,
): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
