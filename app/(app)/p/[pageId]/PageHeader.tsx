"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  renamePage,
  setPageIcon,
  toggleFavorite,
} from "@/lib/actions/pages";
import { EmojiPickerPopover } from "@/components/layout/EmojiPickerPopover";

interface Props {
  id: string;
  initialTitle: string | null;
  initialIcon: string | null;
  initialFavorite: boolean;
}

/**
 * 페이지 본문 헤더 — 아이콘 / 인라인 제목 편집 / 즐겨찾기 별.
 *
 * 표시 상태는 useOptimistic으로 관리하여,
 * - 본인이 액션 호출 시 즉시 낙관적 반영
 * - 다른 곳(사이드바)에서 mutation → revalidate로 props 갱신되면 자동 수렴
 *
 * 편집 입력(draft)만 별도 useState로 관리한다.
 */
export function PageHeader({
  id,
  initialTitle,
  initialIcon,
  initialFavorite,
}: Props) {
  const [optimisticTitle, applyOptimisticTitle] = useOptimistic(
    initialTitle ?? "",
    (_curr: string, next: string) => next,
  );
  const [optimisticIcon, applyOptimisticIcon] = useOptimistic(
    initialIcon,
    (_curr: string | null, next: string | null) => next,
  );
  const [optimisticFav, applyOptimisticFav] = useOptimistic(
    initialFavorite,
    (_curr: boolean, next: boolean) => next,
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [, startTransition] = useTransition();
  // IME 조합 중에는 Enter 키로 제목을 확정하지 않도록 방지
  const composingRef = useRef(false);

  /** 제목 입력 완료 — blur 또는 Enter 키에서 호출 */
  const commitTitle = () => {
    setEditing(false);
    const next = draft.trim();
    // 변경 없으면 서버 호출 생략
    if (next === optimisticTitle) return;
    startTransition(async () => {
      applyOptimisticTitle(next);
      const res = await renamePage(id, next);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 이모지 픽커에서 아이콘 선택 */
  const onIconSelect = (next: string | null) => {
    startTransition(async () => {
      applyOptimisticIcon(next);
      const res = await setPageIcon(id, next);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 즐겨찾기 토글 */
  const onToggleFav = () => {
    startTransition(async () => {
      applyOptimisticFav(!optimisticFav);
      const res = await toggleFavorite(id);
      if (!res.ok) toast.error(res.error);
    });
  };

  return (
    <div className="flex items-start gap-3">
      {/* 아이콘 버튼 — 클릭 시 이모지 픽커 오픈 */}
      <button
        type="button"
        aria-label="아이콘 변경"
        onClick={() => setEmojiOpen(true)}
        className="text-h1"
      >
        {optimisticIcon ?? "📄"}
      </button>

      {/* 인라인 제목 편집 영역 */}
      <div className="flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onCompositionStart={() => (composingRef.current = true)}
            onCompositionEnd={() => (composingRef.current = false)}
            onKeyDown={(e) => {
              // IME 조합 중 Enter는 무시, Escape는 편집 취소
              if (e.key === "Enter" && !composingRef.current) commitTitle();
              else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
            onBlur={commitTitle}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-h1 font-semibold"
          />
        ) : (
          <h1
            className="cursor-text text-h1 font-semibold"
            onDoubleClick={() => {
              setDraft(optimisticTitle);
              setEditing(true);
            }}
          >
            {optimisticTitle || "제목 없음"}
          </h1>
        )}
      </div>

      {/* 즐겨찾기 별 버튼 */}
      <button
        type="button"
        aria-label={optimisticFav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        onClick={onToggleFav}
        className="text-h1"
      >
        {optimisticFav ? "⭐" : "☆"}
      </button>

      {/* 이모지 픽커 팝오버 */}
      <EmojiPickerPopover
        open={emojiOpen}
        onOpenChange={setEmojiOpen}
        onSelect={onIconSelect}
      />
    </div>
  );
}
