"use client";

import Link from "next/link";
import type { PageTreeNode as Node } from "@/lib/pages/types";

interface Props {
  node: Node;
  expanded: ReadonlySet<string>;
  onToggleExpand: (id: string) => void;
}

/**
 * 페이지 트리의 단일 노드.
 * - depth * 12px 인덴트로 계층 표현
 * - 자식이 있으면 펼침/접기 토글 버튼 표시
 * - 자식이 없으면 "·" 표시
 */
export function PageTreeNode({ node, expanded, onToggleExpand }: Props) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded px-2 py-1 hover:bg-background"
        style={{ paddingLeft: `${8 + node.depth * 12}px` }}
      >
        <button
          type="button"
          aria-label={isOpen ? "접기" : "펼치기"}
          onClick={() => onToggleExpand(node.id)}
          className="h-4 w-4 text-text-tertiary"
        >
          {hasChildren ? (isOpen ? "▾" : "▸") : "·"}
        </button>
        <span className="w-4 text-center">{node.icon ?? "📄"}</span>
        <Link
          href={`/p/${node.id}`}
          className="flex-1 truncate text-body text-text-primary"
        >
          {node.title ?? "제목 없음"}
        </Link>
      </div>
      {isOpen &&
        node.children.map((child) => (
          <PageTreeNode
            key={child.id}
            node={child}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </div>
  );
}
