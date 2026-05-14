// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { QuotaExceededModal } from "../QuotaExceededModal";

describe("QuotaExceededModal", () => {
  it("isOpen=false면 렌더 안 됨", () => {
    const { container } = render(
      <QuotaExceededModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("isOpen=true면 안내 + 정리하러 가기 + 닫기 표시", () => {
    const { getByText } = render(
      <QuotaExceededModal isOpen={true} onClose={vi.fn()} />,
    );
    expect(getByText(/한도/)).toBeTruthy();
    expect(getByText(/정리하러 가기/)).toBeTruthy();
    expect(getByText(/닫기/)).toBeTruthy();
  });

  it("닫기 버튼 클릭 시 onClose 호출", () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <QuotaExceededModal isOpen={true} onClose={onClose} />,
    );
    fireEvent.click(getByText("닫기"));
    expect(onClose).toHaveBeenCalled();
  });
});
