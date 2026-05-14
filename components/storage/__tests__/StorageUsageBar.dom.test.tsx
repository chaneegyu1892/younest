import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StorageUsageBar } from "../StorageUsageBar";

const MB = 1024 * 1024;

describe("StorageUsageBar", () => {
  it("0%일 때 표시", () => {
    const { getByText } = render(
      <StorageUsageBar usedBytes={0} limitBytes={100 * MB} />,
    );
    expect(getByText(/0\.0 MB/)).toBeTruthy();
    expect(getByText(/100\.0 MB/)).toBeTruthy();
  });

  it("47%일 때 진행률", () => {
    const { getByRole } = render(
      <StorageUsageBar usedBytes={47 * MB} limitBytes={100 * MB} />,
    );
    const bar = getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("47");
  });

  it("95% 이상이면 경고 색", () => {
    const { container } = render(
      <StorageUsageBar usedBytes={96 * MB} limitBytes={100 * MB} />,
    );
    expect(container.querySelector(".bg-warning, .text-warning")).toBeTruthy();
  });
});
