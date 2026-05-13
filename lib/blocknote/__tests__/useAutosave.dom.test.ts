import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutosave } from "@/lib/blocknote/useAutosave";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useAutosave", () => {
  it("연속 입력 시 디바운스 500ms 후 마지막 값만 1회 저장", async () => {
    const save = vi.fn().mockResolvedValue({ ok: true, updatedAt: "t1" });
    const { result } = renderHook(() => useAutosave("p1", save));

    act(() => result.current.schedule([{ v: 1 }]));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.schedule([{ v: 2 }]));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.schedule([{ v: 3 }]));

    expect(save).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith([{ v: 3 }]);
  });

  it("성공 시 status가 saving → saved 로 전이", async () => {
    const save = vi.fn().mockResolvedValue({ ok: true, updatedAt: "t1" });
    const { result } = renderHook(() => useAutosave("p1", save));

    act(() => result.current.schedule([{ v: 1 }]));
    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(result.current.status).toBe("saved");
  });

  it("실패 시 1s/2s/4s 백오프로 3회 재시도 후 error", async () => {
    const save = vi.fn().mockResolvedValue({ ok: false, error: "save_failed" });
    const { result } = renderHook(() => useAutosave("p1", save));

    act(() => result.current.schedule([{ v: 1 }]));
    await act(async () => { vi.advanceTimersByTime(500); await Promise.resolve(); });
    expect(save).toHaveBeenCalledTimes(1);

    await act(async () => { vi.advanceTimersByTime(1000); await Promise.resolve(); });
    expect(save).toHaveBeenCalledTimes(2);

    await act(async () => { vi.advanceTimersByTime(2000); await Promise.resolve(); });
    expect(save).toHaveBeenCalledTimes(3);

    await act(async () => { vi.advanceTimersByTime(4000); await Promise.resolve(); });
    expect(save).toHaveBeenCalledTimes(4); // 1차 + 재시도 3회

    expect(result.current.status).toBe("error");
  });

  it("error 상태에서 retry() 호출 시 즉시 재시도", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, error: "save_failed" })
      .mockResolvedValueOnce({ ok: false, error: "save_failed" })
      .mockResolvedValueOnce({ ok: false, error: "save_failed" })
      .mockResolvedValueOnce({ ok: false, error: "save_failed" })
      .mockResolvedValueOnce({ ok: true, updatedAt: "t1" });

    const { result } = renderHook(() => useAutosave("p1", save));
    act(() => result.current.schedule([{ v: 1 }]));
    await act(async () => {
      vi.advanceTimersByTime(500 + 1000 + 2000 + 4000);
      await Promise.resolve();
    });
    expect(result.current.status).toBe("error");

    await act(async () => {
      result.current.retry();
      await Promise.resolve();
    });
    expect(result.current.status).toBe("saved");
  });

  it("재시도 중 새 schedule이 들어오면 이전 실패 폐기하고 디바운스 재시작", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, error: "save_failed" })
      .mockResolvedValueOnce({ ok: true, updatedAt: "t2" });

    const { result } = renderHook(() => useAutosave("p1", save));
    act(() => result.current.schedule([{ v: 1 }]));
    await act(async () => { vi.advanceTimersByTime(500); await Promise.resolve(); });

    // 재시도 백오프 대기 중에 새 입력
    act(() => result.current.schedule([{ v: 2 }]));
    // 재시도 대기 1000ms는 폐기되고 새 디바운스 500ms 시작
    await act(async () => { vi.advanceTimersByTime(500); await Promise.resolve(); });

    expect(save).toHaveBeenLastCalledWith([{ v: 2 }]);
    expect(result.current.status).toBe("saved");
  });

  it("flush() 호출 시 pending 입력을 디바운스 무시하고 즉시 저장", async () => {
    const save = vi.fn().mockResolvedValue({ ok: true, updatedAt: "t1" });
    const { result } = renderHook(() => useAutosave("p1", save));

    act(() => result.current.schedule([{ v: 1 }]));
    await act(async () => {
      await result.current.flush();
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith([{ v: 1 }]);
  });

  it("unmount 시 pending 변경을 flush", async () => {
    const save = vi.fn().mockResolvedValue({ ok: true, updatedAt: "t1" });
    const { result, unmount } = renderHook(() => useAutosave("p1", save));

    act(() => result.current.schedule([{ v: 1 }]));
    unmount();
    await Promise.resolve();

    expect(save).toHaveBeenCalledTimes(1);
  });
});
