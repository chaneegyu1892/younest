"use client";

import Link from "next/link";
import { createReactBlockSpec } from "@blocknote/react";

/**
 * 페이지 링크 블록 — pageId 참조. 클릭 시 /p/[pageId]로 라우팅.
 * content: "none" → 인라인 텍스트 편집 불가, props로만 제어.
 */
export const PageLinkBlock = createReactBlockSpec(
  {
    type: "pageLink",
    propSchema: {
      pageId: { default: "" },
      title: { default: "제목 없음" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const pageId = props.block.props.pageId;
      const title = props.block.props.title;

      if (!pageId) {
        return (
          <div
            data-page-link-empty="true"
            data-block-id={props.block.id}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px dashed rgb(209 213 219)",
              color: "rgb(107 114 128)",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            페이지 선택…
          </div>
        );
      }

      return (
        <Link
          href={`/p/${pageId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            background: "rgb(243 244 246)",
            color: "rgb(31 41 55)",
            textDecoration: "none",
            fontWeight: 500,
            cursor: "pointer",
          }}
          contentEditable={false}
        >
          <span aria-hidden>📄</span>
          <span>{title}</span>
          <span style={{ color: "rgb(156 163 175)", fontSize: "0.75rem" }}>
            ({pageId.slice(0, 8)})
          </span>
        </Link>
      );
    },
  },
);
