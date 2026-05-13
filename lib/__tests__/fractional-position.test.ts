import { describe, it, expect } from "vitest";
import {
  positionBetween,
  FractionalPrecisionError,
} from "@/lib/pages/fractional-position";

describe("positionBetween", () => {
  it("빈 부모: positionBetween(null, null) = 1", () => {
    expect(positionBetween(null, null)).toBe(1);
  });

  it("맨 위 끼우기: before=null, after=2 → 1", () => {
    expect(positionBetween(null, 2)).toBe(1);
  });

  it("맨 아래 끼우기: before=5, after=null → 6", () => {
    expect(positionBetween(5, null)).toBe(6);
  });

  it("사이 끼우기: positionBetween(2, 3) = 2.5", () => {
    expect(positionBetween(2, 3)).toBe(2.5);
  });

  it("재 사이: positionBetween(2, 2.5) = 2.25", () => {
    expect(positionBetween(2, 2.5)).toBe(2.25);
  });

  it("정밀도 한계: positionBetween(1.5, 1.5 + 1e-12) throws FractionalPrecisionError", () => {
    expect(() => positionBetween(1.5, 1.5 + 1e-12)).toThrow(
      FractionalPrecisionError,
    );
  });
});
