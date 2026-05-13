"use client";

import {
  createBlockConfig,
  createBlockSpec,
  createToggleWrapper,
  defaultProps,
} from "@blocknote/core";

/**
 * 토글 블록 — 헤더 인라인 텍스트 + 자식 블록 펼침/접힘.
 *
 * BlockNote의 createToggleWrapper helper를 이용해 chevron 버튼·자식 표시 토글·
 * "Add block" 버튼·localStorage 상태 저장을 모두 위임. 자식 블록은 Tab 인덴트로 추가.
 *
 * propSchema의 `open`은 M0 PoC 라운드트립 테스트와의 호환성을 위해 남겨두지만
 * 실제 펼침 상태는 createToggleWrapper가 localStorage(`toggle-{blockId}`)로 관리.
 */
const toggleConfig = createBlockConfig(
  () =>
    ({
      type: "toggle" as const,
      propSchema: {
        textAlignment: defaultProps.textAlignment,
        textColor: defaultProps.textColor,
        open: { default: true, values: [true, false] } as const,
      },
      content: "inline" as const,
    }) as const,
);

export const ToggleBlock = createBlockSpec(toggleConfig, {
  render: (block, editor) => {
    const contentEl = document.createElement("div");
    contentEl.style.flex = "1";
    contentEl.style.minWidth = "0";

    const wrapper = createToggleWrapper(
      block as never,
      editor as never,
      contentEl,
    );

    return { ...wrapper, contentDOM: contentEl };
  },
});
