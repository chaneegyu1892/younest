import { fetchUserImages } from "@/lib/supabase/queries/images";
import { getStorageUsage, listOrphanImages } from "@/lib/actions/images";
import { StorageUsageBar } from "@/components/storage/StorageUsageBar";
import { StorageManagerClient } from "./StorageManagerClient";

interface SearchParams {
  tab?: string;
}

/**
 * S-018 스토리지 페이지.
 * - 사용량 progress bar
 * - 탭: 전체 / 사용 안 하는
 * - ImageGrid + 일괄 삭제
 */
export default async function StorageSettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "orphan" ? "orphan" : "all";

  const [images, usage, orphan] = await Promise.all([
    fetchUserImages(),
    getStorageUsage(),
    listOrphanImages(),
  ]);

  if (!usage.ok) {
    return <div className="p-6">사용량을 불러올 수 없어요.</div>;
  }
  const orphanIds = orphan.ok ? orphan.data.ids : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="text-h1 font-semibold text-text-primary">스토리지</h1>
      </header>
      <StorageUsageBar
        usedBytes={usage.data.usedBytes}
        limitBytes={usage.data.limitBytes}
      />
      <StorageManagerClient
        images={images}
        orphanIds={orphanIds}
        currentTab={tab}
      />
    </div>
  );
}
