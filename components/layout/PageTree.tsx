"use client";

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { buildTree } from "@/lib/pages/tree";
import { reduceTree } from "@/lib/pages/reducer";
import {
  loadExpandedIds,
  saveExpandedIds,
  toggleExpanded,
} from "@/lib/pages/expanded-state";
import { createPage, renamePage, toggleFavorite, setPageIcon, movePage, softDeletePage, restorePage } from "@/lib/actions/pages";
import { collectDescendantIds } from "@/lib/pages/tree";
import type { PageNode, OptimisticMutation } from "@/lib/pages/types";
import { PageTreeNode } from "./PageTreeNode";
import { MovePageModal } from "./MovePageModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

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
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // hydration 완료 전엔 트리를 숨겨 잘못된 접힘 상태가 깜빡이는 현상을 방지
  const [hydrated, setHydrated] = useState(false);
  const [optimistic, applyOptimistic] = useOptimistic(
    pages,
    (state: PageNode[], mutation: OptimisticMutation) =>
      reduceTree(state, mutation),
  );
  const [, startTransition] = useTransition();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 삭제 모달에 표시할 하위 페이지 수 (자기 자신 제외)
  const deletingChildren = deletingId
    ? collectDescendantIds(optimistic, deletingId).length - 1
    : 0;

  // SSR 안전: 마운트 후에만 localStorage 읽기 + hydration 완료 표시
  useEffect(() => {
    setExpanded(loadExpandedIds());
    setHydrated(true);
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

  /** 즐겨찾기 상태를 토글한다 (낙관적 업데이트) */
  const onToggleFav = (id: string) => {
    const current = optimistic.find((n) => n.id === id);
    if (!current) return;
    startTransition(async () => {
      applyOptimistic({ kind: "toggleFavorite", id, is_favorite: !current.is_favorite });
      const res = await toggleFavorite(id);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 페이지 아이콘을 변경한다 (낙관적 업데이트) */
  const onSetIcon = (id: string, icon: string | null) => {
    startTransition(async () => {
      applyOptimistic({ kind: "setIcon", id, icon });
      const res = await setPageIcon(id, icon);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 페이지 이동 모달 열기 */
  const onMove = (id: string) => setMovingId(id);

  /** 이동 모달에서 확인 → 낙관적 업데이트 후 서버 액션 호출 */
  const handleMoveSubmit = (newParentId: string | null) => {
    if (!movingId) return;
    const id = movingId;
    setMovingId(null);
    startTransition(async () => {
      // newPosition은 서버에서 nextPosition()으로 결정. 낙관적 변경은 임시 큰 값.
      applyOptimistic({ kind: "move", id, newParentId, newPosition: Number.MAX_SAFE_INTEGER });
      const res = await movePage(id, newParentId);
      if (!res.ok) toast.error(res.error);
    });
  };

  /**
   * 소프트 삭제 실행. 낙관적 업데이트 후 서버 액션 호출.
   * 성공 시 5초짜리 Undo 토스트를 띄운다.
   */
  const performDelete = (id: string) => {
    const localIds = collectDescendantIds(optimistic, id);
    // 현재 보고 있는 페이지가 삭제 대상(자기 또는 후손)이면 대시보드로 이동
    if (localIds.some((did) => pathname === `/p/${did}`)) {
      router.push("/dashboard");
    }

    startTransition(async () => {
      applyOptimistic({ kind: "softDelete", deletedIds: localIds });
      const res = await softDeletePage(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const deletedIds = res.data.deletedIds;
      toast.success("휴지통으로 이동했어요", {
        duration: 5000,
        action: {
          label: "실행 취소",
          onClick: async () => {
            const undo = await restorePage(deletedIds);
            if (!undo.ok) toast.error(undo.error);
          },
        },
      });
    });
  };

  /**
   * 삭제 요청 진입점.
   * - 하위 페이지가 없으면 바로 삭제.
   * - 하위 페이지가 있으면 확인 모달을 띄운다.
   */
  const onDelete = (id: string) => {
    const childCount = collectDescendantIds(optimistic, id).length - 1;
    if (childCount === 0) {
      performDelete(id);
    } else {
      setDeletingId(id);
    }
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
    <>
      <div className={hydrated ? "space-y-px" : "invisible space-y-px"}>
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
            onToggleFavorite={onToggleFav}
            onSetIcon={onSetIcon}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}
      </div>
      {movingId && (
        <MovePageModal
          open
          movingId={movingId}
          pages={optimistic}
          onCancel={() => setMovingId(null)}
          onSubmit={handleMoveSubmit}
        />
      )}
      <DeleteConfirmModal
        open={deletingId !== null}
        childCount={deletingChildren}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          const id = deletingId!;
          setDeletingId(null);
          performDelete(id);
        }}
      />
    </>
  );
}
