-- 00001_initial_schema.sql
-- younest 초기 스키마 (PRD §9 기준)
-- 8개 테이블: users, pages, blocks, db_properties, db_views, db_rows, images, audit_logs

-- updated_at 자동 갱신 트리거 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- users: 카카오 OAuth 사용자 프로필 + E2E 암호화 키
-- id는 auth.users(id)와 동일 (Supabase Auth 연결)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  kakao_id text unique not null,
  nickname text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'banned')),
  is_admin boolean not null default false,
  e2e_salt bytea,
  wrapped_dek bytea,
  wrapped_dek_recovery bytea,
  created_at timestamptz not null default now()
);

comment on column public.users.e2e_salt is 'PBKDF2 salt (PIN -> MK 유도용)';
comment on column public.users.wrapped_dek is 'MK로 암호화된 DEK (비공개 콘텐츠 복호화 키)';
comment on column public.users.wrapped_dek_recovery is 'Recovery Key로 암호화된 DEK';

-- ============================================================
-- pages: document | database 페이지 (트리 구조)
-- ============================================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  parent_page_id uuid references public.pages(id) on delete cascade,
  type text not null check (type in ('document', 'database')),
  title text,
  title_encrypted bytea,
  icon text,
  cover_url text,
  is_private boolean not null default false,
  is_favorite boolean not null default false,
  position integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- ============================================================
-- blocks: BlockNote 블록 (document 페이지 콘텐츠)
-- ============================================================
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  parent_block_id uuid references public.blocks(id) on delete cascade,
  type text not null,
  content jsonb,
  content_encrypted bytea,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blocks_set_updated_at
  before update on public.blocks
  for each row execute function public.set_updated_at();

-- ============================================================
-- db_properties: database 페이지의 컬럼 정의 (7종 속성)
-- ============================================================
create table public.db_properties (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  name text not null,
  type text not null,
  options jsonb,
  position integer not null default 0
);

-- ============================================================
-- db_views: database 페이지의 뷰 정의 (5종 뷰)
-- ============================================================
create table public.db_views (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  name text not null,
  type text not null,
  config jsonb,
  position integer not null default 0,
  is_default boolean not null default false
);

-- ============================================================
-- db_rows: database 페이지의 행 (각 행은 옵션으로 별도 페이지 가질 수 있음)
-- ============================================================
create table public.db_rows (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  row_page_id uuid references public.pages(id) on delete set null,
  property_values jsonb,
  property_values_encrypted bytea,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger db_rows_set_updated_at
  before update on public.db_rows
  for each row execute function public.set_updated_at();

-- ============================================================
-- images: 업로드된 이미지 메타 (실제 파일은 Supabase Storage)
-- ============================================================
create table public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  page_id uuid references public.pages(id) on delete set null,
  storage_path text not null,
  encrypted boolean not null default false,
  size_bytes integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- audit_logs: 어드민/시스템 감사 로그 (PRD §8.5)
-- target_id는 다양한 테이블 참조 가능하므로 FK 미설정
-- ============================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  created_at timestamptz not null default now()
);
