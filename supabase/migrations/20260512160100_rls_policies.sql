-- 00002_rls_policies.sql
-- 모든 테이블 RLS 활성화 + 본인 격리 정책
-- 원칙: auth.uid() = user_id (직접) 또는 page_id 경유 간접 확인
-- 어드민은 콘텐츠 테이블(pages/blocks/db_*/images) SELECT 차단 (PRD §8.5)

-- ============================================================
-- users
-- ============================================================
alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- INSERT/DELETE는 service_role(서버 측 카카오 콜백/어드민)만 수행
-- service_role은 RLS bypass하므로 별도 정책 불필요

-- ============================================================
-- pages
-- ============================================================
alter table public.pages enable row level security;

create policy "pages_select_own" on public.pages
  for select using (auth.uid() = user_id);

create policy "pages_insert_own" on public.pages
  for insert with check (auth.uid() = user_id);

create policy "pages_update_own" on public.pages
  for update using (auth.uid() = user_id);

create policy "pages_delete_own" on public.pages
  for delete using (auth.uid() = user_id);

-- ============================================================
-- blocks: page_id 경유 본인 페이지 소속 확인
-- ============================================================
alter table public.blocks enable row level security;

create policy "blocks_select_own" on public.blocks
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = blocks.page_id and p.user_id = auth.uid()
    )
  );

create policy "blocks_insert_own" on public.blocks
  for insert with check (
    exists (
      select 1 from public.pages p
      where p.id = blocks.page_id and p.user_id = auth.uid()
    )
  );

create policy "blocks_update_own" on public.blocks
  for update using (
    exists (
      select 1 from public.pages p
      where p.id = blocks.page_id and p.user_id = auth.uid()
    )
  );

create policy "blocks_delete_own" on public.blocks
  for delete using (
    exists (
      select 1 from public.pages p
      where p.id = blocks.page_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- db_properties
-- ============================================================
alter table public.db_properties enable row level security;

create policy "db_properties_select_own" on public.db_properties
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = db_properties.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_properties_insert_own" on public.db_properties
  for insert with check (
    exists (
      select 1 from public.pages p
      where p.id = db_properties.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_properties_update_own" on public.db_properties
  for update using (
    exists (
      select 1 from public.pages p
      where p.id = db_properties.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_properties_delete_own" on public.db_properties
  for delete using (
    exists (
      select 1 from public.pages p
      where p.id = db_properties.page_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- db_views
-- ============================================================
alter table public.db_views enable row level security;

create policy "db_views_select_own" on public.db_views
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = db_views.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_views_insert_own" on public.db_views
  for insert with check (
    exists (
      select 1 from public.pages p
      where p.id = db_views.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_views_update_own" on public.db_views
  for update using (
    exists (
      select 1 from public.pages p
      where p.id = db_views.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_views_delete_own" on public.db_views
  for delete using (
    exists (
      select 1 from public.pages p
      where p.id = db_views.page_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- db_rows
-- ============================================================
alter table public.db_rows enable row level security;

create policy "db_rows_select_own" on public.db_rows
  for select using (
    exists (
      select 1 from public.pages p
      where p.id = db_rows.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_rows_insert_own" on public.db_rows
  for insert with check (
    exists (
      select 1 from public.pages p
      where p.id = db_rows.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_rows_update_own" on public.db_rows
  for update using (
    exists (
      select 1 from public.pages p
      where p.id = db_rows.page_id and p.user_id = auth.uid()
    )
  );

create policy "db_rows_delete_own" on public.db_rows
  for delete using (
    exists (
      select 1 from public.pages p
      where p.id = db_rows.page_id and p.user_id = auth.uid()
    )
  );

-- ============================================================
-- images
-- ============================================================
alter table public.images enable row level security;

create policy "images_select_own" on public.images
  for select using (auth.uid() = user_id);

create policy "images_insert_own" on public.images
  for insert with check (auth.uid() = user_id);

create policy "images_update_own" on public.images
  for update using (auth.uid() = user_id);

create policy "images_delete_own" on public.images
  for delete using (auth.uid() = user_id);

-- ============================================================
-- audit_logs: 본인 행위만 SELECT, INSERT는 service_role 전용 (RLS bypass)
-- ============================================================
alter table public.audit_logs enable row level security;

create policy "audit_logs_select_own" on public.audit_logs
  for select using (auth.uid() = actor_id);
