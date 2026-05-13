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
/**
 * 슬래시 명령으로 커스텀 블록 삽입 시 현재 라인을 새 블록으로 교체.
 * insertBlocks(..., "after")를 쓰면 빈 paragraph가 위에 남아 다음 줄에 생기는 것처럼 보임.
 */
function replaceCurrentBlock(editor: YounestEditor, block: unknown) {
  const current = editor.getTextCursorPosition().block;
  (editor as unknown as {
    replaceBlocks: (refs: unknown[], blocks: unknown[]) => void;
  }).replaceBlocks([current], [block]);
}

export function getSlashMenuItems(
  editor: YounestEditor,
): DefaultReactSuggestionItem[] {
  return [
    ...getDefaultReactSlashMenuItems(editor as never),
    {
      title: "토글",
      subtext: "접고 펼 수 있는 블록",
      onItemClick: () =>
        replaceCurrentBlock(editor, {
          type: "toggle",
          props: { open: true },
          content: [],
        }),
      aliases: ["toggle", "토글"],
      group: "기본",
    },
    {
      title: "콜아웃",
      subtext: "강조 박스",
      onItemClick: () =>
        replaceCurrentBlock(editor, {
          type: "callout",
          props: { emoji: "💡", variant: "info" },
          content: [],
        }),
      aliases: ["callout", "콜아웃"],
      group: "기본",
    },
    {
      title: "페이지 링크",
      subtext: "다른 페이지로 연결",
      onItemClick: () =>
        replaceCurrentBlock(editor, {
          type: "pageLink",
          props: { pageId: "", title: "" },
        }),
      aliases: ["page", "link", "페이지"],
      group: "기본",
    },
  ];
}

export { filterSuggestionItems };
