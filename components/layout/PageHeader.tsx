interface PageHeaderProps {
  icon?: string;
  title: string;
  isPrivate?: boolean;
  isFavorite?: boolean;
}

/**
 * 페이지 상단 헤더. 아이콘 + 제목 + 비공개/즐겨찾기 뱃지.
 * 자물쇠 토글, 더보기 메뉴는 M2/M5에서 추가.
 */
export function PageHeader({
  icon,
  title,
  isPrivate,
  isFavorite,
}: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="text-2xl" aria-hidden>
              {icon}
            </span>
          )}
          <h1 className="truncate text-h1 font-semibold text-text-primary">
            {title}
          </h1>
          {isPrivate && (
            <span className="flex-shrink-0 rounded-full bg-private/10 px-2 py-0.5 text-caption font-medium text-private">
              🔒 비공개
            </span>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {isFavorite && (
            <span aria-label="즐겨찾기" title="즐겨찾기">
              ⭐
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
