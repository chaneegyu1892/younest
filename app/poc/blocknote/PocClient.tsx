"use client";

import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { filterSuggestionItems } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { schema } from "@/lib/blocknote/schema";

export default function PocClient() {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "heading",
        props: { level: 2 },
        content: "BlockNote PoC — 커스텀 블록 3종 테스트",
      },
      {
        type: "paragraph",
        content:
          "슬래시(/) 를 입력해서 토글 / 콜아웃 / 페이지 링크 메뉴를 확인하세요. 한글 입력도 자유롭게 테스트.",
      },
    ],
  });

  return (
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
                subtext: "다른 페이지로 점프 (테스트용 pageId)",
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
  );
}
