"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createQuickPage } from "@/lib/actions/quick-create";

type Template = "memo" | "diary" | "prayer";

const ITEMS: { template: Template; icon: string; label: string }[] = [
  { template: "memo", icon: "📝", label: "메모" },
  { template: "diary", icon: "📖", label: "일기" },
  { template: "prayer", icon: "🙏", label: "기도제목" },
];

/**
 * 빠른 작성 위젯 — 메모/일기/기도제목 3 템플릿 버튼.
 * 각 템플릿마다 부모 프로젝트 페이지 + 오늘 자식 페이지가 생성/재사용된다.
 * 자식 페이지로 이동. 실패 시 toast.
 */
export function QuickCreate() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick(template: Template) {
    start(async () => {
      const result = await createQuickPage(template);
      if (!result.ok) {
        toast.error(`페이지 생성 실패: ${result.error}`);
        return;
      }
      router.push(`/p/${result.data.pageId}`);
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-h2 font-medium text-text-primary">빠른 작성</h2>
      <div className="grid grid-cols-3 gap-3">
        {ITEMS.map(({ template, icon, label }) => (
          <button
            key={template}
            type="button"
            disabled={pending}
            onClick={() => handleClick(template)}
            className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface px-4 py-4 text-body text-text-primary hover:bg-background disabled:opacity-50"
          >
            <span className="text-h1">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
