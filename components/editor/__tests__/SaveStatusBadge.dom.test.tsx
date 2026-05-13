import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SaveStatusBadge } from "@/components/editor/SaveStatusBadge";

describe("SaveStatusBadge", () => {
  it("status='saving'일 때 '저장 중…' 표시", () => {
    render(<SaveStatusBadge status="saving" lastSavedAt={null} onRetry={() => {}} />);
    expect(screen.getByText(/저장 중/)).toBeTruthy();
  });

  it("status='saved'에 lastSavedAt 있으면 '저장됨' 표시", () => {
    render(
      <SaveStatusBadge
        status="saved"
        lastSavedAt={new Date().toISOString()}
        onRetry={() => {}}
      />,
    );
    expect(screen.getByText(/저장됨/)).toBeTruthy();
  });

  it("status='error'면 '저장 실패' + 재시도 버튼", () => {
    let retried = false;
    render(
      <SaveStatusBadge
        status="error"
        lastSavedAt={null}
        onRetry={() => {
          retried = true;
        }}
      />,
    );
    expect(screen.getByText(/저장 실패/)).toBeTruthy();
    const btn = screen.getByRole("button", { name: /다시 시도/ });
    btn.click();
    expect(retried).toBe(true);
  });

  it("status='idle'에 lastSavedAt 없으면 아무것도 안 보임 (빈 텍스트 또는 invisible)", () => {
    const { container } = render(
      <SaveStatusBadge status="idle" lastSavedAt={null} onRetry={() => {}} />,
    );
    expect(container.textContent?.trim()).toBe("");
  });
});
