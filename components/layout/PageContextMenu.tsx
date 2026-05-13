"use client";

import { useState } from "react";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

interface Props {
  open: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onAddChild: () => void;
  onToggleFavorite: () => void;
  onMove: () => void;
  onDelete: () => void;
  onSetIcon: (icon: string | null) => void;
  isFavorite: boolean;
}

export function PageContextMenu(props: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);

  if (!props.open) return null;

  return (
    <>
      {/* 메뉴 외부 클릭 시 닫기용 오버레이 */}
      <div className="fixed inset-0 z-40" onClick={props.onClose} />
      <div
        className="fixed z-50 w-48 rounded-md border border-border bg-surface py-1 shadow-lg"
        style={{ top: props.y, left: props.x }}
      >
        <Item
          onClick={() => {
            props.onAddChild();
            props.onClose();
          }}
        >
          + 하위 페이지 추가
        </Item>
        <Item
          onClick={() => {
            props.onToggleFavorite();
            props.onClose();
          }}
        >
          {props.isFavorite ? "⭐ 즐겨찾기 해제" : "☆ 즐겨찾기 추가"}
        </Item>
        <Item onClick={() => setEmojiOpen(true)}>🎨 아이콘 변경</Item>
        <Item
          onClick={() => {
            props.onMove();
            props.onClose();
          }}
        >
          ↗ 다른 페이지로 이동
        </Item>
        <Item
          onClick={() => {
            props.onDelete();
            props.onClose();
          }}
          danger
        >
          🗑️ 삭제
        </Item>
      </div>
      <EmojiPickerPopover
        open={emojiOpen}
        onOpenChange={setEmojiOpen}
        onSelect={(emoji) => {
          props.onSetIcon(emoji);
          props.onClose();
        }}
      />
    </>
  );
}

/** 메뉴 항목 버튼 */
function Item({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2 text-left text-body hover:bg-background ${
        danger ? "text-status-error" : "text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}
