-- M2.3: 검색을 위한 본문 평탄화 컬럼 + GIN trgm 인덱스 + RPC

-- 1) pg_trgm 확장
create extension if not exists pg_trgm;

-- 2) content_text 평탄화 컬럼
alter table pages add column if not exists content_text text;

-- 3) BlockNote jsonb에서 텍스트 노드 추출
create or replace function extract_blocknote_text(doc jsonb)
returns text
language plpgsql
immutable
as $$
declare
  result text;
begin
  begin
    select string_agg(value, ' ')
    into result
    from jsonb_path_query(doc, 'strict $.**.text ? (@.type() == "string")') as t,
         lateral (select t #>> '{}') as v(value);
    return result;
  exception when others then
    return null;
  end;
end
$$;

-- 4) 트리거: pages.content 변경 시 content_text 자동 갱신
--    is_private은 현재 컬럼 없음(M5에서 추가). 도입 시 if new.is_private then null 분기 추가 예정.
create or replace function pages_content_text_trigger()
returns trigger
language plpgsql
as $$
begin
  if new.content is null then
    new.content_text := null;
  else
    new.content_text := extract_blocknote_text(new.content);
  end if;
  return new;
end
$$;

drop trigger if exists pages_content_text_sync on pages;
create trigger pages_content_text_sync
  before insert or update of content on pages
  for each row execute function pages_content_text_trigger();

-- 5) 백필
update pages
set content_text = extract_blocknote_text(content)
where content is not null;

-- 6) GIN trigram 인덱스
create index if not exists pages_title_trgm_idx
  on pages using gin (title gin_trgm_ops);
create index if not exists pages_content_text_trgm_idx
  on pages using gin (content_text gin_trgm_ops);

-- 7) 검색 RPC — RLS는 SECURITY INVOKER (기본) 로 자연 적용
create or replace function search_pages(
  q text,
  sort_mode text default 'relevance',
  result_limit int default 30,
  result_offset int default 0
)
returns setof pages
language sql
stable
as $$
  select *
  from pages
  where deleted_at is null
    and user_id = auth.uid()
    and (
      title ilike '%' || q || '%'
      or content_text ilike '%' || q || '%'
    )
  order by
    case when sort_mode = 'relevance' then
      case when title ilike '%' || q || '%' then 0 else 1 end
    else 1 end,
    updated_at desc
  limit result_limit
  offset result_offset
$$;

grant execute on function search_pages(text, text, int, int) to authenticated;
