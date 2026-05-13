"use client";

import {
  type DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import type { YounestEditor } from "@/lib/blocknote/schema";

/**
 * 디폴트 슬래시 메뉴 + 커스텀 블록 3종.
 * pageLink는 빈 props로 삽입하고, 블록 내부에서 PageLinkPickerModal 트리거.
 */
export function getSlashMenuItems(
  editor: YounestEditor,
): DefaultReactSuggestionItem[] {
  return [
    ...getDefaultReactSlashMenuItems(editor as never),
    {
      title: "토글",
      subtext: "접고 펼 수 있는 블록",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "toggle", props: { open: true }, content: [] }],
          editor.getTextCursorPosition().block,
          "after",
        );
      },
      aliases: ["toggle", "토글"],
      group: "기본",
    },
    {
      title: "콜아웃",
      subtext: "강조 박스",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "callout", props: { emoji: "💡", variant: "info" }, content: [] }],
          editor.getTextCursorPosition().block,
          "after",
        );
      },
      aliases: ["callout", "콜아웃"],
      group: "기본",
    },
    {
      title: "페이지 링크",
      subtext: "다른 페이지로 연결",
      onItemClick: () => {
        editor.insertBlocks(
          [{ type: "pageLink", props: { pageId: "", title: "" } }],
          editor.getTextCursorPosition().block,
          "after",
        );
      },
      aliases: ["page", "link", "페이지"],
      group: "기본",
    },
  ];
}

export { filterSuggestionItems };
