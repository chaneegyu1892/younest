"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { buildTree } from "@/lib/pages/tree";
import { reduceTree } from "@/lib/pages/reducer";
import {
  loadExpandedIds,
  saveExpandedIds,
  toggleExpanded,
} from "@/lib/pages/expanded-state";
import { createPage, renamePage } from "@/lib/actions/pages";
import type { PageNode, OptimisticMutation } from "@/lib/pages/types";
import { PageTreeNode } from "./PageTreeNode";

interface Props {
  pages: PageNode[];
}

/**
 * flat PageNode 배열을 받아 트리로 변환하여 렌더링.
 * - 펼침 상태는 localStorage에 저장/복원 (SSR 안전)
 * - buildTree 결과를 useMemo로 캐싱하여 불필요한 재계산 방지
 * - useOptimistic으로 이름 변경 낙관적 업데이트 지원
 */
export function PageTree({ pages }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [optimistic, applyOptimistic] = useOptimistic(
    pages,
    (state: PageNode[], mutation: OptimisticMutation) =>
      reduceTree(state, mutation),
  );
  const [, startTransition] = useTransition();

  // SSR 안전: 마운트 후에만 localStorage 읽기
  useEffect(() => {
    setExpanded(loadExpandedIds());
  }, []);

  const tree = useMemo(() => buildTree(optimistic), [optimistic]);

  const onToggle = (id: string) => {
    const next = toggleExpanded(expanded, id);
    setExpanded(next);
    saveExpandedIds(next);
  };

  const onRename = (id: string, title: string) => {
    startTransition(async () => {
      applyOptimistic({ kind: "rename", id, title });
      const res = await renamePage(id, title);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 자식 페이지 생성 후 부모를 자동 펼침하고 새 페이지로 이동 */
  const onAddChild = (parentId: string | null) => {
    startTransition(async () => {
      const res = await createPage({ parentPageId: parentId, type: "document" });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      // 자식 추가 시 부모를 자동 펼침
      if (parentId) {
        const next = new Set(expanded);
        next.add(parentId);
        setExpanded(next);
        saveExpandedIds(next);
      }
      router.push(`/p/${res.data.id}`);
    });
  };

  return (
    <div className="space-y-px">
      {/* 루트 페이지 추가 버튼 */}
      <div className="mb-1 flex justify-end px-2">
        <button
          type="button"
          onClick={() => onAddChild(null)}
          className="rounded px-2 py-0.5 text-caption text-text-secondary hover:bg-background"
        >
          + 새 페이지
        </button>
      </div>
      {tree.map((node) => (
        <PageTreeNode
          key={node.id}
          node={node}
          expanded={expanded}
          onToggleExpand={onToggle}
          onRename={onRename}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}
