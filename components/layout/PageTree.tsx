"use client";

import { useEffect, useState, useMemo } from "react";
import { buildTree } from "@/lib/pages/tree";
import {
  loadExpandedIds,
  saveExpandedIds,
  toggleExpanded,
} from "@/lib/pages/expanded-state";
import type { PageNode } from "@/lib/pages/types";
import { PageTreeNode } from "./PageTreeNode";

interface Props {
  pages: PageNode[];
}

/**
 * flat PageNode 배열을 받아 트리로 변환하여 렌더링.
 * - 펼침 상태는 localStorage에 저장/복원 (SSR 안전)
 * - buildTree 결과를 useMemo로 캐싱하여 불필요한 재계산 방지
 */
export function PageTree({ pages }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // SSR 안전: 마운트 후에만 localStorage 읽기
  useEffect(() => {
    setExpanded(loadExpandedIds());
  }, []);

  const tree = useMemo(() => buildTree(pages), [pages]);

  const onToggle = (id: string) => {
    const next = toggleExpanded(expanded, id);
    setExpanded(next);
    saveExpandedIds(next);
  };

  return (
    <div className="space-y-px">
      {tree.map((node) => (
        <PageTreeNode
          key={node.id}
          node={node}
          expanded={expanded}
          onToggleExpand={onToggle}
        />
      ))}
    </div>
  );
}
