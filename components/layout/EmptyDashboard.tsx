"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createPage } from "@/lib/actions/pages";

/**
 * 페이지가 하나도 없을 때 대시보드에 표시되는 빈 상태 컴포넌트.
 * "새 페이지" 버튼 클릭 시 루트 document 페이지를 생성하고 이동.
 */
export function EmptyDashboard() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-dashed border-border bg-surface p-8 text-center">
      <h2 className="text-h2 font-semibold">첫 페이지를 만들어보세요</h2>
      <p className="mt-2 text-body text-text-secondary">
        일기, 메모, 기도제목 — 무엇이든 자유롭게 적을 수 있어요.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await createPage({
              parentPageId: null,
              type: "document",
            });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            router.push(`/p/${res.data.id}`);
          })
        }
        className="mt-4 rounded-md bg-primary px-4 py-2 text-body font-medium text-primary-foreground disabled:opacity-50"
      >
        + 새 페이지
      </button>
    </div>
  );
}
