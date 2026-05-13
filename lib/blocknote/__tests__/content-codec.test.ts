import { describe, it, expect, vi } from "vitest";
import {
  serializeContent,
  deserializeContent,
} from "@/lib/blocknote/content-codec";

describe("content-codec", () => {
  it("null → null 라운드트립 (신규 페이지)", () => {
    expect(serializeContent(null)).toEqual({ plain: null, encrypted: null });
    expect(
      deserializeContent({ plain: null, encrypted: null })
    ).toBeNull();
  });

  it("BlockNote document 배열을 plain에 그대로 통과 (M2.2 평문 모드)", () => {
    const doc = [
      {
        id: "1",
        type: "paragraph",
        props: {},
        content: [{ type: "text", text: "안녕" }],
      },
    ];
    const ser = serializeContent(doc);
    expect(ser).toEqual({ plain: doc, encrypted: null });
    expect(deserializeContent(ser)).toEqual(doc);
  });

  it("plain만 있는 row를 deserialize 시 doc 반환", () => {
    const doc = [{ id: "x", type: "paragraph", props: {}, content: [] }];
    expect(deserializeContent({ plain: doc, encrypted: null })).toEqual(doc);
  });

  it("encrypted가 있고 plain은 null인 row는 (M2.2 한정) 빈 doc로 폴백 + 콘솔 경고", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = deserializeContent({
      plain: null,
      encrypted: new Uint8Array([1, 2, 3]),
    });
    expect(out).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("encrypted content")
    );
    warn.mockRestore();
  });
});
