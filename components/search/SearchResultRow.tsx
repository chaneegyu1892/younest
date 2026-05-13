"use client";

import React from "react";
import type { SearchHit } from "@/lib/search/types";

interface Props {
  hit: SearchHit;
  onSelect: (hit: SearchHit) => void;
  isActive?: boolean;
}

export function SearchResultRow({ hit, onSelect, isActive = false }: Props) {
  const title = hit.title?.trim() ? hit.title : "제목 없음";
  const icon = hit.icon ?? "📄";

  return (
    <button
      type="button"
      onClick={() => onSelect(hit)}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body hover:bg-background ${
        isActive ? "bg-background" : ""
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="flex-1 truncate text-text-primary">{title}</span>
    </button>
  );
}
