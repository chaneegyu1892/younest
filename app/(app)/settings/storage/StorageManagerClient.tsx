"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ImageRow } from "@/lib/images/types";
import { ImageGrid } from "@/components/storage/ImageGrid";
import { deleteImages } from "@/lib/actions/images";

interface Props {
  images: ImageRow[];
  orphanIds: string[];
  currentTab: "all" | "orphan";
}

/**
 * 탭(전체/사용 안 하는) + ImageGrid + deleteImages 호출 통합.
 */
export function StorageManagerClient({ images, orphanIds, currentTab }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const orphanSet = new Set(orphanIds);
  const filtered =
    currentTab === "orphan" ? images.filter((i) => orphanSet.has(i.id)) : images;

  async function handleDelete(ids: string[]) {
    const result = await deleteImages(ids);
    if (!result.ok) {
      toast.error(`삭제 실패: ${result.error}`);
      return;
    }
    toast.success(`${result.data.deletedCount}장 삭제 완료`);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <nav className="mb-3 flex gap-2 border-b border-border">
        <Link
          href="/settings/storage"
          className={`px-3 py-2 text-body ${
            currentTab === "all"
              ? "border-b-2 border-primary text-primary"
              : "text-text-secondary"
          }`}
        >
          전체 ({images.length})
        </Link>
        <Link
          href={"/settings/storage?tab=orphan" as never}
          className={`px-3 py-2 text-body ${
            currentTab === "orphan"
              ? "border-b-2 border-primary text-primary"
              : "text-text-secondary"
          }`}
        >
          사용 안 하는 ({orphanIds.length})
        </Link>
      </nav>
      <ImageGrid images={filtered} onDelete={handleDelete} />
    </div>
  );
}
