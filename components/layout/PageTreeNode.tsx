"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import type { PageTreeNode as Node } from "@/lib/pages/types";

interface Props {
  node: Node;
  expanded: ReadonlySet<string>;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

/**
 * 페이지 트리의 단일 노드.
 * - depth * 12px 인덴트로 계층 표현
 * - 자식이 있으면 펼침/접기 토글 버튼 표시
 * - 자식이 없으면 "·" 표시
 * - 제목 더블클릭 → 인라인 input 편집 모드 전환
 * - Enter: 저장 (IME 변환 중이면 무시), Escape: 취소, Blur: 저장
 */
export function PageTreeNode({
  node,
  expanded,
  onToggleExpand,
  onRename,
}: Props) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.title ?? "");
  // IME 변환 중 Enter 무시를 위한 ref
  const composingRef = useRef(false);

  /** 편집 내용을 저장하고 편집 모드를 종료한다 */
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== (node.title ?? "")) onRename(node.id, next);
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded py-1 pr-2 hover:bg-background"
        style={{ paddingLeft: `${8 + node.depth * 12}px` }}
      >
        <button
          type="button"
          aria-label={isOpen ? "접기" : "펼치기"}
          onClick={() => hasChildren && onToggleExpand(node.id)}
          disabled={!hasChildren}
          className="h-4 w-4 text-text-tertiary disabled:cursor-default"
        >
          {hasChildren ? (isOpen ? "▾" : "▸") : "·"}
        </button>
        <span className="w-4 text-center">{node.icon ?? "📄"}</span>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !composingRef.current) {
                commit();
              } else if (e.key === "Escape") {
                setEditing(false);
                setDraft(node.title ?? "");
              }
            }}
            onBlur={commit}
            className="flex-1 rounded border border-border bg-surface px-1 py-0 text-body"
          />
        ) : (
          <Link
            href={`/p/${node.id}`}
            onDoubleClick={(e) => {
              e.preventDefault();
              setDraft(node.title ?? "");
              setEditing(true);
            }}
            className="flex-1 truncate text-body text-text-primary"
          >
            {node.title || "제목 없음"}
          </Link>
        )}
      </div>
      {isOpen &&
        node.children.map((child) => (
          <PageTreeNode
            key={child.id}
            node={child}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            onRename={onRename}
          />
        ))}
    </div>
  );
}
