"use client";

import { useRef, useState, useTransition } from "react";
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

export function PageHeader({ id, initialTitle, initialIcon, initialFavorite }: Props) {
  const [title, setTitle] = useState(initialTitle ?? "");
  const [icon, setIcon] = useState(initialIcon);
  const [fav, setFav] = useState(initialFavorite);
  const [editing, setEditing] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [, start] = useTransition();
  // IME 조합 중에는 Enter 키로 제목을 확정하지 않도록 방지
  const composingRef = useRef(false);

  /** 제목 입력 완료 — blur 또는 Enter 키에서 호출 */
  const commitTitle = () => {
    setEditing(false);
    const next = title.trim();
    // 변경 없으면 서버 호출 생략
    if (next === (initialTitle ?? "")) return;
    start(async () => {
      const res = await renamePage(id, next);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 이모지 픽커에서 아이콘 선택 */
  const onIconSelect = (next: string | null) => {
    setIcon(next);
    start(async () => {
      const res = await setPageIcon(id, next);
      if (!res.ok) toast.error(res.error);
    });
  };

  /** 즐겨찾기 토글 */
  const onToggleFav = () => {
    // 낙관적 UI 업데이트
    setFav((v) => !v);
    start(async () => {
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
        {icon ?? "📄"}
      </button>

      {/* 인라인 제목 편집 영역 */}
      <div className="flex-1">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onCompositionStart={() => (composingRef.current = true)}
            onCompositionEnd={() => (composingRef.current = false)}
            onKeyDown={(e) => {
              // IME 조합 중 Enter는 무시, Escape는 편집 취소
              if (e.key === "Enter" && !composingRef.current) commitTitle();
              else if (e.key === "Escape") {
                setEditing(false);
                setTitle(initialTitle ?? "");
              }
            }}
            onBlur={commitTitle}
            className="w-full rounded border border-border bg-surface px-2 py-1 text-h1 font-semibold"
          />
        ) : (
          <h1
            className="cursor-text text-h1 font-semibold"
            onDoubleClick={() => setEditing(true)}
          >
            {title || "제목 없음"}
          </h1>
        )}
      </div>

      {/* 즐겨찾기 별 버튼 */}
      <button
        type="button"
        aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        onClick={onToggleFav}
        className="text-h1"
      >
        {fav ? "⭐" : "☆"}
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
