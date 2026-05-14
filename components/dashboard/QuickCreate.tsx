"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createPage } from "@/lib/actions/pages";

type Template = "memo" | "diary" | "prayer";

function getTemplate(t: Template): { title: string; icon: string; label: string } {
  if (t === "memo") return { title: "메모", icon: "📝", label: "메모" };
  if (t === "diary") {
    const today = new Date().toISOString().slice(0, 10);
    return { title: `${today} 일기`, icon: "📖", label: "일기" };
  }
  return { title: "기도제목", icon: "🙏", label: "기도제목" };
}

const TEMPLATES: Template[] = ["memo", "diary", "prayer"];

/**
 * 빠른 작성 위젯 — 메모/일기/기도제목 3 템플릿 버튼.
 * 클릭 시 createPage 호출 + 새 페이지로 이동. 실패 시 toast.
 */
export function QuickCreate() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick(t: Template) {
    start(async () => {
      const { title, icon } = getTemplate(t);
      const result = await createPage({
        parentPageId: null,
        type: "document",
        title,
        icon,
      });
      if (!result.ok) {
        toast.error(`페이지 생성 실패: ${result.error}`);
        return;
      }
      router.push(`/p/${result.data.id}`);
    });
  }

  return (
    <section>
      <h2 className="mb-3 text-h2 font-medium text-text-primary">빠른 작성</h2>
      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((t) => {
          const { icon, label } = getTemplate(t);
          return (
            <button
              key={t}
              type="button"
              disabled={pending}
              onClick={() => handleClick(t)}
              className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface px-4 py-4 text-body text-text-primary hover:bg-background disabled:opacity-50"
            >
              <span className="text-h1">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
