-- M2.4: position 컬럼을 fractional indexing 지원하도록 double precision으로 변경.
-- 기존 정수 값은 무손실 캐스팅으로 보존.

alter table pages
  alter column position type double precision
  using position::double precision;
