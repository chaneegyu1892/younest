import { describe, it, expect } from "vitest";
import { escapeIlike } from "@/lib/search/escape";

describe("escapeIlike", () => {
  it("일반 문자는 그대로", () => {
    expect(escapeIlike("hello")).toBe("hello");
    expect(escapeIlike("안녕")).toBe("안녕");
  });

  it("% 는 \\%로", () => {
    expect(escapeIlike("100%")).toBe("100\\%");
  });

  it("_ 는 \\_로", () => {
    expect(escapeIlike("a_b")).toBe("a\\_b");
  });

  it("\\ 는 \\\\로", () => {
    expect(escapeIlike("a\\b")).toBe("a\\\\b");
  });

  it("여러 메타문자 동시 처리", () => {
    expect(escapeIlike("100%_\\")).toBe("100\\%\\_\\\\");
  });
});
