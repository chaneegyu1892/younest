"use client";

import { createPage } from "@/lib/actions/pages";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

/**
 * 페이지가 없을 때 사이드바에 표시하는 빈 상태 컴포넌트.
 * "+ 새 페이지" 버튼 클릭 시 루트 document 페이지를 생성하고 이동.
 */
export function EmptyPagesState() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="px-3 py-2">
      <p className="text-caption text-text-tertiary">아직 페이지가 없어요</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await createPage({ parentPageId: null, type: "document" });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            router.push(`/p/${res.data.id}`);
          })
        }
        className="mt-2 text-body text-primary hover:underline disabled:opacity-50"
      >
        + 새 페이지
      </button>
    </div>
  );
}
