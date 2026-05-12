-- 00003_indexes.sql
-- 성능 인덱스

create index idx_pages_user_id on public.pages(user_id);
create index idx_pages_parent on public.pages(parent_page_id);
create index idx_pages_user_deleted on public.pages(user_id, deleted_at);

create index idx_blocks_page_id on public.blocks(page_id);
create index idx_blocks_position on public.blocks(page_id, position);

create index idx_db_rows_page on public.db_rows(page_id);
create index idx_db_views_page on public.db_views(page_id);
create index idx_db_properties_page on public.db_properties(page_id);

create index idx_images_user on public.images(user_id);

-- 전문 검색 (공개 페이지만, 휴지통 제외)
create index idx_pages_title_search on public.pages
  using gin (to_tsvector('simple', coalesce(title, '')))
  where is_private = false and deleted_at is null;
