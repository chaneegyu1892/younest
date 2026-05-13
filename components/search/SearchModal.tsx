"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchPagesAction } from "@/lib/search/actions-search";
import type { SearchHit } from "@/lib/search/types";
import { SearchInput } from "./SearchInput";
import { SearchResultRow } from "./SearchResultRow";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DEBOUNCE_MS = 200;
const MODAL_LIMIT = 10;

export function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  // 모달 닫힐 때 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      setQ("");
      setHits([]);
      setActiveIdx(0);
    }
  }, [isOpen]);

  // 입력 debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const query = q.trim();
    if (!isOpen || query.length === 0) {
      setHits([]);
      return;
    }
    const myReq = ++reqIdRef.current;
    timerRef.current = setTimeout(async () => {
      const result = await searchPagesAction({ q: query, limit: MODAL_LIMIT });
      // 더 새 요청이 시작됐으면 무시
      if (myReq !== reqIdRef.current) return;
      if (result.ok) {
        setHits(result.data.hits);
        setActiveIdx(0);
      } else {
        setHits([]);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, isOpen]);

  if (!isOpen) return null;

  function selectHit(hit: SearchHit) {
    router.push(`/p/${hit.id}`);
    onClose();
  }

  function goToResultsPage() {
    if (q.trim().length === 0) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    onClose();
  }

  function handleEnter(modCmd: boolean) {
    if (modCmd) {
      goToResultsPage();
      return;
    }
    const hit = hits[activeIdx];
    if (hit) selectHit(hit);
  }

  return (
    <div
      role="dialog"
      aria-label="검색"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[20vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] overflow-hidden rounded-lg bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <SearchInput
          value={q}
          onChange={setQ}
          onArrowDown={() =>
            setActiveIdx((idx) => Math.min(hits.length - 1, idx + 1))
          }
          onArrowUp={() => setActiveIdx((idx) => Math.max(0, idx - 1))}
          onEnter={handleEnter}
          onEscape={onClose}
        />
        <div className="max-h-[400px] overflow-y-auto p-2">
          {q.trim().length === 0 && (
            <p className="px-3 py-2 text-caption text-text-tertiary">
              검색어를 입력하세요
            </p>
          )}
          {q.trim().length > 0 && hits.length === 0 && (
            <p className="px-3 py-2 text-caption text-text-tertiary">
              결과 없음
            </p>
          )}
          {hits.map((hit, idx) => (
            <SearchResultRow
              key={hit.id}
              hit={hit}
              onSelect={selectHit}
              isActive={idx === activeIdx}
            />
          ))}
        </div>
        {q.trim().length > 0 && (
          <button
            type="button"
            onClick={goToResultsPage}
            className="block w-full border-t border-border px-4 py-2 text-left text-caption text-text-secondary hover:bg-background"
          >
            전체 결과 보기 →
          </button>
        )}
      </div>
    </div>
  );
}
