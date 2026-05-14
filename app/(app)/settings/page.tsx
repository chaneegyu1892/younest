import Link from "next/link";

/**
 * S-016 설정 (계정).
 * 좌측 nav: 계정 / 스토리지. 보안·복구는 M5에서 활성화.
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-4xl gap-6 p-6">
      <aside className="w-40 shrink-0 space-y-1">
        <Link
          href="/settings"
          className="block rounded-md bg-background px-3 py-2 text-body font-medium text-primary"
        >
          계정
        </Link>
        <Link
          href="/settings/storage"
          className="block rounded-md px-3 py-2 text-body text-text-secondary hover:bg-background"
        >
          스토리지
        </Link>
      </aside>
      <section className="flex-1">
        <h1 className="text-h1 font-semibold text-text-primary">계정</h1>
        <p className="mt-2 text-body text-text-secondary">
          닉네임 편집과 로그아웃은 v2에서 추가 예정입니다.
        </p>
      </section>
    </div>
  );
}
