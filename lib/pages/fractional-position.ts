const REBALANCE_THRESHOLD = 1e-9;
const FRACTIONAL_FALLBACK = 1;

/**
 * 두 형제 사이의 새 fractional position 계산.
 * - before/after는 위/아래 형제의 position. 양 끝이면 null.
 * - 반환값은 before < x < after 를 만족.
 * - 정밀도 한계(차이가 1e-9 미만)면 FractionalPrecisionError throw.
 *   호출자가 catch해서 nextPosition fallback 사용.
 */
export function positionBetween(
  before: number | null,
  after: number | null,
): number {
  if (before === null && after === null) return FRACTIONAL_FALLBACK;
  if (before === null) return after! - 1;
  if (after === null) return before + 1;

  if (Math.abs(after - before) < REBALANCE_THRESHOLD) {
    throw new FractionalPrecisionError(before, after);
  }
  const result = (before + after) / 2;
  if (!Number.isFinite(result)) {
    throw new FractionalPrecisionError(before, after);
  }
  return result;
}

export class FractionalPrecisionError extends Error {
  constructor(
    public before: number,
    public after: number,
  ) {
    super(`positionBetween precision limit: before=${before}, after=${after}`);
    this.name = "FractionalPrecisionError";
  }
}
