"use client";

import React, { useState, useTransition } from "react";
import type { ImageRow } from "@/lib/images/types";

interface ImageGridProps {
  images: ImageRow[];
  onDelete: (ids: string[]) => Promise<void> | void;
}

/**
 * 이미지 다중 선택 그리드.
 * - 체크박스 토글로 선택, "선택 삭제" 버튼이 onDelete(ids) 호출
 * - 선택 없으면 버튼 disabled
 */
export function ImageGrid({ images, onDelete }: ImageGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  if (images.length === 0) {
    return (
      <p className="py-12 text-center text-body text-text-tertiary">
        업로드된 이미지가 없어요.
      </p>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    start(async () => {
      await onDelete(ids);
      setSelected(new Set());
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-caption text-text-tertiary">
          {selected.size}개 선택
        </span>
        <button
          type="button"
          disabled={selected.size === 0 || pending}
          onClick={handleDelete}
          className="rounded-md bg-error px-3 py-1.5 text-caption font-medium text-white disabled:opacity-50"
        >
          선택 삭제
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {images.map((img) => {
          const isSelected = selected.has(img.id);
          return (
            // eslint-disable-next-line jsx-a11y/label-has-associated-control
            <label
              key={img.id}
              className={`group relative block aspect-square overflow-hidden rounded-md border ${
                isSelected ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.public_url}
                alt=""
                className="h-full w-full object-cover"
              />
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(img.id)}
                aria-label="이미지 선택"
                className="absolute left-2 top-2 h-4 w-4"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
