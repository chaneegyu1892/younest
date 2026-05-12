import { describe, it, expect } from "vitest";
import {
  encryptString,
  decryptString,
  generateDek,
} from "@/lib/crypto/aes-gcm";

/**
 * BlockNote document 라운드트립 — PoC 핵심 검증.
 * 실제 BlockNote 인스턴스는 jsdom + DOM 환경이 필요해 별도 .dom.test.tsx에서.
 * 본 테스트는 BlockNote가 출력할 직렬화 가능한 JSON 구조가 라운드트립 무손실인지만 확인.
 */
describe("BlockNote document AES-GCM 라운드트립", () => {
  it("기본 블록 + 커스텀 블록 3종이 JSON 직렬화 → 암호화 → 복호화 후 동일", async () => {
    const dek = await generateDek();
    const doc = [
      {
        id: "1",
        type: "paragraph",
        props: {},
        content: [{ type: "text", text: "안녕하세요" }],
      },
      {
        id: "2",
        type: "heading",
        props: { level: 1 },
        content: [{ type: "text", text: "헤더 1" }],
      },
      {
        id: "3",
        type: "toggle",
        props: { open: true, textAlignment: "left", textColor: "default" },
        content: [{ type: "text", text: "토글 헤더" }],
        children: [
          {
            id: "3-1",
            type: "paragraph",
            content: [{ type: "text", text: "자식" }],
          },
        ],
      },
      {
        id: "4",
        type: "callout",
        props: {
          emoji: "💡",
          variant: "info",
          textAlignment: "left",
          textColor: "default",
        },
        content: [{ type: "text", text: "콜아웃 본문" }],
      },
      {
        id: "5",
        type: "pageLink",
        props: { pageId: "abc-12345678", title: "샘플 페이지" },
      },
    ];

    const json = JSON.stringify(doc);
    const enc = await encryptString(json, dek);
    const dec = await decryptString(enc, dek);

    expect(JSON.parse(dec)).toEqual(doc);
  });

  it("긴 한글 문서도 라운드트립 무손실", async () => {
    const dek = await generateDek();
    const longText = "안녕하세요. ".repeat(500); // 약 6000자
    const doc = [
      {
        id: "long",
        type: "paragraph",
        content: [{ type: "text", text: longText }],
      },
    ];
    const json = JSON.stringify(doc);
    const enc = await encryptString(json, dek);
    const dec = await decryptString(enc, dek);
    expect(JSON.parse(dec)).toEqual(doc);
  });

  it("특수문자/이모지/한자가 섞여도 라운드트립 무손실", async () => {
    const dek = await generateDek();
    const doc = [
      {
        id: "x",
        type: "callout",
        props: { emoji: "🎉", variant: "success" },
        content: [
          { type: "text", text: "한자 漢字 + 이모지 🌈 + 특수 ※⚠️ + \"인용\"" },
        ],
      },
    ];
    const json = JSON.stringify(doc);
    const enc = await encryptString(json, dek);
    const dec = await decryptString(enc, dek);
    expect(JSON.parse(dec)).toEqual(doc);
  });
});
