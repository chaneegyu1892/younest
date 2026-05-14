import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "@/lib/utils/relative-time";

const now = new Date("2026-05-14T12:00:00Z");

describe("formatRelativeTime", () => {
  it("60초 미만이면 '방금 전'", () => {
    expect(formatRelativeTime("2026-05-14T11:59:30Z", now)).toBe("방금 전");
  });

  it("60분 미만은 '~분 전'", () => {
    expect(formatRelativeTime("2026-05-14T11:55:00Z", now)).toBe("5분 전");
  });

  it("24시간 미만은 '~시간 전'", () => {
    expect(formatRelativeTime("2026-05-14T09:00:00Z", now)).toBe("3시간 전");
  });

  it("7일 미만은 '~일 전'", () => {
    expect(formatRelativeTime("2026-05-12T12:00:00Z", now)).toBe("2일 전");
  });

  it("4주 미만은 '~주 전'", () => {
    expect(formatRelativeTime("2026-05-01T12:00:00Z", now)).toBe("1주 전");
  });

  it("4주 이상은 절대 날짜", () => {
    const result = formatRelativeTime("2026-01-15T12:00:00Z", now);
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/15/);
  });
});
