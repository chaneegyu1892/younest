"use client";

import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

/**
 * 콜아웃 블록 — 이모지 + 컬러 배경 + 인라인 텍스트.
 * Notion 스타일 callout.
 */
export const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      emoji: { default: "💡" },
      variant: {
        default: "info",
        values: ["info", "warning", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const variantBg: Record<string, string> = {
        info: "rgb(239 246 255)",
        warning: "rgb(254 252 232)",
        success: "rgb(240 253 244)",
      };
      const variantBorder: Record<string, string> = {
        info: "rgb(191 219 254)",
        warning: "rgb(254 240 138)",
        success: "rgb(187 247 208)",
      };
      const variant = props.block.props.variant;

      return (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.5rem",
            background: variantBg[variant] ?? variantBg.info,
            border: `1px solid ${variantBorder[variant] ?? variantBorder.info}`,
            width: "100%",
          }}
        >
          <span style={{ fontSize: "1.25rem", lineHeight: 1.5 }}>
            {props.block.props.emoji}
          </span>
          <div
            ref={props.contentRef}
            style={{ flex: 1, lineHeight: 1.6 }}
          />
        </div>
      );
    },
  },
);
