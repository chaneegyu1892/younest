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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pageId: string, // reserved for Task 11 — sessionStorage backup keyed by pageId
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
  }, [save]);

  const schedule = useCallback(
    (content: unknown[] | null) => {
      ref.current.pending = content;
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
    [doSave],
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
  // error 상태가 아닌 경우(debounce 대기 중인 변경만)에만 flush
  const statusRef = useRef<AutosaveStatus>("idle");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    // ref는 DOM 노드가 아닌 mutable ref이므로 cleanup 내 .current 접근이 안전하다.
    // 캡처를 위해 ref 객체 자체를 로컬 변수에 저장한다.
    const internalRef = ref;
    return () => {
      // 재시도 실패(error) 상태나 이미 진행 중인 경우는 flush 불필요 — debounce 대기 중인 것만
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (internalRef.current.pending !== undefined && internalRef.current.debounceTimer !== null) {
        void doSave();
      }
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, lastSavedAt, schedule, flush, retry };
}
