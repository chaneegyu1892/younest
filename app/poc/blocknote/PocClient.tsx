"use client";

import { useState, useRef } from "react";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { filterSuggestionItems } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { schema } from "@/lib/blocknote/schema";
import {
  generateDek,
  encryptString,
  decryptString,
  type EncryptedPayload,
} from "@/lib/crypto/aes-gcm";

export default function PocClient() {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "heading",
        props: { level: 2 },
        content: "BlockNote PoC — 커스텀 블록 3종 + 암호화 라운드트립",
      },
      {
        type: "paragraph",
        content:
          "슬래시(/)로 토글/콜아웃/페이지 링크 삽입. 한글 입력 자유롭게 테스트.",
      },
    ],
  });

  const dekRef = useRef<CryptoKey | null>(null);
  const encryptedRef = useRef<EncryptedPayload | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleEncrypt() {
    if (!dekRef.current) dekRef.current = await generateDek();
    const doc = editor.document;
    const json = JSON.stringify(doc);
    const payload = await encryptString(json, dekRef.current);
    encryptedRef.current = payload;
    setStatus(
      `암호화 완료 — 블록 ${doc.length}개, ciphertext ${payload.ciphertext.byteLength}B, IV ${payload.iv.byteLength}B`,
    );
  }

  function handleClear() {
    editor.replaceBlocks(editor.document, [
      { type: "paragraph", content: "에디터가 비워졌습니다." },
    ]);
    setStatus("에디터 비움 — 복호화 버튼으로 복원하세요.");
  }

  async function handleDecrypt() {
    if (!encryptedRef.current || !dekRef.current) {
      setStatus("⚠️ 먼저 암호화를 실행하세요.");
      return;
    }
    const json = await decryptString(encryptedRef.current, dekRef.current);
    // BlockNote의 PartialBlock[] 형식. 타입 안전을 위해 unknown → 변환.
    const doc = JSON.parse(json) as Parameters<
      typeof editor.replaceBlocks
    >[1];
    editor.replaceBlocks(editor.document, doc);
    setStatus(`복호화 완료 — ${doc.length}개 블록 복원`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleEncrypt}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          1. 암호화
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          2. 에디터 비우기
        </button>
        <button
          type="button"
          onClick={handleDecrypt}
          className="rounded-md bg-private px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          3. 복호화
        </button>
      </div>
      {status && (
        <p className="text-xs text-text-secondary" role="status">
          {status}
        </p>
      )}
      <BlockNoteView editor={editor} slashMenu={false}>
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              [
                {
                  title: "토글",
                  subtext: "펼치기/접기 가능한 블록",
                  aliases: ["toggle", "ㅌㅎ", "tg"],
                  group: "younest 커스텀",
                  onItemClick: () => {
                    editor.insertBlocks(
                      [
                        {
                          type: "toggle",
                          props: { open: true },
                          content: "토글 헤더",
                        },
                      ],
                      editor.getTextCursorPosition().block,
                      "after",
                    );
                  },
                },
                {
                  title: "콜아웃",
                  subtext: "💡 이모지 + 컬러 배경",
                  aliases: ["callout", "ㅋㅇ", "co"],
                  group: "younest 커스텀",
                  onItemClick: () => {
                    editor.insertBlocks(
                      [
                        {
                          type: "callout",
                          props: { emoji: "💡", variant: "info" },
                          content: "여기에 콜아웃 내용",
                        },
                      ],
                      editor.getTextCursorPosition().block,
                      "after",
                    );
                  },
                },
                {
                  title: "페이지 링크",
                  subtext: "다른 페이지로 점프 (테스트용)",
                  aliases: ["page", "link", "ㅍㅇㅈ"],
                  group: "younest 커스텀",
                  onItemClick: () => {
                    editor.insertBlocks(
                      [
                        {
                          type: "pageLink",
                          props: {
                            pageId: "demo-page-12345678",
                            title: "샘플 페이지",
                          },
                        },
                      ],
                      editor.getTextCursorPosition().block,
                      "after",
                    );
                  },
                },
                ...getDefaultReactSlashMenuItems(editor),
              ],
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
