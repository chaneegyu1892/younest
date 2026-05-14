"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageTreeNode as Node } from "@/lib/pages/types";
import { PageContextMenu } from "./PageContextMenu";
import { PageDropZone } from "./PageDropZone";

/** 더블클릭 감지 윈도우 (ms) — 이 시간 안에 두 번째 클릭이 들어오면 편집 진입 */
const DOUBLE_CLICK_WINDOW = 250;

interface Props {
  node: Node;
  expanded: ReadonlySet<string>;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onAddChild: (parentId: string) => void;
  onToggleFavorite: (id: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
  onSetIcon: (id: string, icon: string | null) => void;
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
  onAddChild,
  onToggleFavorite,
  onMove,
  onDelete,
  onSetIcon,
}: Props) {
  const isOpen = expanded.has(node.id);
  const hasChildren = node.children.length > 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.title ?? "");
  // IME 변환 중 Enter 무시를 위한 ref
  const composingRef = useRef(false);
  // 컨텍스트 메뉴 위치 상태 (null이면 닫힘)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  // 모바일 롱프레스 타이머 ref — 500ms 유지 시 컨텍스트 메뉴 오픈
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // single-click → navigate 지연 타이머 (더블클릭 감지를 위해 250ms 대기)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  /** 제목 영역 클릭 — 1회는 지연 후 이동, 2회 안에 들어오면 편집 진입 */
  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (clickTimer.current) {
      // 더블클릭 — 예약된 이동 취소 + 편집 모드 진입
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      setDraft(node.title ?? "");
      setEditing(true);
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      router.push(`/p/${node.id}`);
    }, DOUBLE_CLICK_WINDOW);
  };

  /** 편집 내용을 저장하고 편집 모드를 종료한다 */
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== (node.title ?? "")) onRename(node.id, next);
  };

  // dnd-kit sortable — 노드 자체가 draggable이 되며, transform/transition은 dragging 중 비주얼 처리
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PageDropZone id={`${node.id}-above`} />
      <div
        className="group flex items-center gap-1 rounded py-1 pr-2 hover:bg-background"
        style={{ paddingLeft: `${8 + node.depth * 12}px` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuPos({ x: e.clientX, y: e.clientY });
        }}
        onTouchStart={(e) => {
          // noUncheckedIndexedAccess 때문에 Touch | undefined — 가드 필수
          const t = e.touches[0];
          if (!t) return;
          const x = t.clientX;
          const y = t.clientY;
          longPressTimer.current = setTimeout(() => {
            setMenuPos({ x, y });
          }, 500);
        }}
        onTouchEnd={() => {
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
        }}
        onTouchMove={() => {
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
        }}
      >
        <button
          type="button"
          aria-label="드래그 핸들"
          {...attributes}
          {...listeners}
          className="invisible flex h-5 w-4 flex-shrink-0 cursor-grab items-center justify-center text-text-secondary group-hover:visible"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden>
            <circle cx="2.5" cy="2.5" r="1.2" />
            <circle cx="7.5" cy="2.5" r="1.2" />
            <circle cx="2.5" cy="7" r="1.2" />
            <circle cx="7.5" cy="7" r="1.2" />
            <circle cx="2.5" cy="11.5" r="1.2" />
            <circle cx="7.5" cy="11.5" r="1.2" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={isOpen ? "접기" : "펼치기"}
          onClick={() => hasChildren && onToggleExpand(node.id)}
          disabled={!hasChildren}
          className="h-4 w-4 text-text-tertiary disabled:cursor-default"
        >
          {hasChildren ? (isOpen ? "▾" : "▸") : ""}
        </button>
        <span className="mr-1 w-4 text-center">{node.icon ?? "📄"}</span>
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
          // Link 대신 span — Link는 single-click이 즉시 navigate되어
          // 두 번째 클릭 전에 unmount되므로 onDoubleClick이 동작하지 않음.
          // 250ms 윈도우로 single/double을 구분.
          <span
            role="link"
            tabIndex={0}
            onClick={handleTitleClick}
            className="flex-1 cursor-pointer truncate text-body text-text-primary"
          >
            {node.title || "제목 없음"}
          </span>
        )}
        {/* hover 시 노출되는 하위 페이지 추가 버튼 */}
        <button
          type="button"
          aria-label="하위 페이지 추가"
          onClick={(e) => {
            e.preventDefault();
            onAddChild(node.id);
          }}
          className="invisible h-5 w-5 rounded text-text-tertiary group-hover:visible hover:bg-surface"
        >
          +
        </button>
        {/* hover 시 노출되는 컨텍스트 메뉴 버튼 */}
        <button
          type="button"
          aria-label="메뉴"
          onClick={(e) => {
            e.preventDefault();
            const r = e.currentTarget.getBoundingClientRect();
            setMenuPos({ x: r.left, y: r.bottom });
          }}
          className="invisible h-5 w-5 rounded text-text-tertiary group-hover:visible hover:bg-surface"
        >
          ⋯
        </button>
      </div>
      <PageDropZone id={`${node.id}-below`} />
      {/* 컨텍스트 메뉴 */}
      <PageContextMenu
        open={menuPos !== null}
        x={menuPos?.x ?? 0}
        y={menuPos?.y ?? 0}
        onClose={() => setMenuPos(null)}
        onAddChild={() => onAddChild(node.id)}
        onToggleFavorite={() => onToggleFavorite(node.id)}
        onMove={() => onMove(node.id)}
        onDelete={() => onDelete(node.id)}
        onSetIcon={(icon) => onSetIcon(node.id, icon)}
        isFavorite={node.is_favorite}
      />
      {isOpen &&
        node.children.map((child) => (
          <PageTreeNode
            key={child.id}
            node={child}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            onRename={onRename}
            onAddChild={onAddChild}
            onToggleFavorite={onToggleFavorite}
            onMove={onMove}
            onDelete={onDelete}
            onSetIcon={onSetIcon}
          />
        ))}
    </div>
  );
}
