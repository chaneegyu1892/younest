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
  // props.block.props.open은 영구 저장값 — 단순 표시용은 로컬 상태로 토글
  const [open, setOpen] = useState<boolean>(props.block.props.open);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            // editor.updateBlock 시그니처는 BlockNote 내부 타입에 의존 — props 통째로 캐스팅
            (props.editor as unknown as {
              updateBlock: (b: unknown, p: { props: { open: boolean } }) => void;
            }).updateBlock(props.block, { props: { open: next } });
          }}
          aria-label={open ? "접기" : "펼치기"}
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
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 120ms ease",
          }}
        >
          ▶
        </button>
        <div ref={props.contentRef} style={{ flex: 1 }} />
      </div>
      {/* 자식 블록은 BlockNote가 자동 렌더 — open=false면 CSS로 숨김 */}
      <div
        style={{
          marginLeft: "1.5rem",
          display: open ? "block" : "none",
        }}
        data-toggle-children={open ? "open" : "closed"}
      />
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
