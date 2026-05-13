"use client";

import { useState } from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import type { BlockNoteEditor } from "@blocknote/core";

interface ToggleRenderProps {
  block: {
    props: { open: boolean };
    [key: string]: unknown;
  };
  editor: BlockNoteEditor;
  contentRef?: (node: HTMLElement | null) => void;
}

function ToggleRender(props: ToggleRenderProps) {
  // M2.2: 헤더 인라인 텍스트 + 펼침/접힘 시각 표시만. 진짜 nested children은 후속 phase.
  const [open, setOpen] = useState<boolean>(props.block.props.open);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          (props.editor as unknown as {
            updateBlock: (b: unknown, p: { props: { open: boolean } }) => void;
          }).updateBlock(props.block, { props: { open: next } });
        }}
        aria-label={open ? "접기" : "펼치기"}
        contentEditable={false}
        style={{
          cursor: "pointer",
          background: "transparent",
          border: "none",
          padding: 0,
          width: "1rem",
          height: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 120ms ease",
          color: "rgb(107 114 128)",
          fontSize: "0.75rem",
        }}
      >
        ▶
      </button>
      <div ref={props.contentRef} style={{ flex: 1, minWidth: 0 }} />
    </div>
  );
}

/**
 * 토글 블록 — 헤더 라인 + 펼치기/접기 (자식 블록은 BlockNote의 children 시스템 사용).
 */
export const ToggleBlock = createReactBlockSpec(
  {
    type: "toggle",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      open: { default: true, values: [true, false] },
    },
    content: "inline",
  },
  {
    // BlockNote의 generic 타입과 좁은 ToggleRender 시그니처 사이 캐스팅
    render: ToggleRender as never,
  },
);
