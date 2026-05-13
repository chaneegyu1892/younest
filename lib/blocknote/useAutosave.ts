"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export type SaveFn = (content: unknown[] | null) => Promise<SaveResult>;

type Internal = {
  pending: unknown[] | null | undefined; // undefined = nothing scheduled
  debounceTimer: ReturnType<typeof setTimeout> | null;
  retryTimer: ReturnType<typeof setTimeout> | null;
  retryCount: number;
  firstAttemptTime: number; // fake-timer-safe: when the first save attempt started
};

const DEBOUNCE_MS = 500;
const BACKOFFS = [1000, 2000, 4000];

export function useAutosave(
  pageId: string,
  save: SaveFn,
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const ref = useRef<Internal>({
    pending: undefined,
    debounceTimer: null,
    retryTimer: null,
    retryCount: 0,
    firstAttemptTime: 0,
  });

  const clearTimers = useCallback(() => {
    if (ref.current.debounceTimer) {
      clearTimeout(ref.current.debounceTimer);
      ref.current.debounceTimer = null;
    }
    if (ref.current.retryTimer) {
      clearTimeout(ref.current.retryTimer);
      ref.current.retryTimer = null;
    }
  }, []);

  const doSave = useCallback(async () => {
    if (ref.current.pending === undefined) return;
    const payload = ref.current.pending;

    // 첫 시도 시 시작 시간 기록 (재시도 지연 계산에 사용)
    if (ref.current.retryCount === 0) {
      ref.current.firstAttemptTime = Date.now();
    }

    setStatus("saving");
    const result = await save(payload);

    if (result.ok) {
      // pending이 같은 값일 때만 confirm — 그 사이 새 입력이 들어왔다면 다음 사이클에 처리
      if (ref.current.pending === payload) {
        ref.current.pending = undefined;
        ref.current.retryCount = 0;
        setLastSavedAt(result.updatedAt);
        setStatus("saved");
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem(`younest:autosave-pending:${pageId}`);
          } catch {}
        }
      }
    } else {
      if (ref.current.retryCount < BACKOFFS.length) {
        // 경과 시간 기반 나머지 지연 계산
        // (fake 타이머 환경에서 일괄 시간 진행 시에도 즉시 재시도 가능하도록)
        const elapsed = Date.now() - ref.current.firstAttemptTime;
        const cumulativeDelay = BACKOFFS.slice(0, ref.current.retryCount + 1).reduce(
          (a, b) => a + b,
          0,
        );
        const remainingDelay = Math.max(0, cumulativeDelay - elapsed);
        ref.current.retryCount += 1;

        if (remainingDelay === 0) {
          // 이미 충분한 시간이 경과했으면 마이크로태스크로 즉시 재시도
          queueMicrotask(() => void doSave());
        } else {
          // 아직 대기 시간이 남아 있으면 setTimeout으로 예약
          ref.current.retryTimer = setTimeout(() => {
            ref.current.retryTimer = null;
            void doSave();
          }, remainingDelay);
        }
      } else {
        setStatus("error");
      }
    }
  }, [save, pageId]);

  const schedule = useCallback(
    (content: unknown[] | null) => {
      ref.current.pending = content;
      // beforeunload용 sessionStorage 백업 (PageBody의 sendBeacon이 읽음)
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            `younest:autosave-pending:${pageId}`,
            JSON.stringify(content),
          );
        } catch {}
      }
      // 새 입력 시 진행 중인 재시도 폐기 + retryCount 초기화 + 디바운스 재시작
      if (ref.current.retryTimer) {
        clearTimeout(ref.current.retryTimer);
        ref.current.retryTimer = null;
        ref.current.retryCount = 0;
      }
      if (ref.current.debounceTimer) {
        clearTimeout(ref.current.debounceTimer);
      }
      ref.current.debounceTimer = setTimeout(() => {
        ref.current.debounceTimer = null;
        void doSave();
      }, DEBOUNCE_MS);
    },
    [doSave, pageId],
  );

  const flush = useCallback(async () => {
    if (ref.current.debounceTimer) {
      clearTimeout(ref.current.debounceTimer);
      ref.current.debounceTimer = null;
    }
    if (ref.current.retryTimer) {
      clearTimeout(ref.current.retryTimer);
      ref.current.retryTimer = null;
    }
    if (ref.current.pending !== undefined) {
      await doSave();
    }
  }, [doSave]);

  const retry = useCallback(() => {
    ref.current.retryCount = 0;
    void doSave();
  }, [doSave]);

  // unmount 시 pending flush + 타이머 정리
  useEffect(() => {
    const internalRef = ref;
    return () => {
      // unmount 시 pending이 있으면 상태(debounce/retry/error) 무관하게 flush 시도.
      // debounce/retry 타이머는 어차피 사라지므로 데이터 손실 방지를 위해 즉시 호출.
      if (internalRef.current.pending !== undefined) {
        void doSave();
      }
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, lastSavedAt, schedule, flush, retry };
}
