-- pages.content: BlockNote document JSON (평문, M2.2~M4)
-- pages.content_encrypted: 비공개 모드(M5)에서 editor.document를 DEK로 AES-GCM 암호화한 ciphertext
-- 두 컬럼은 동시 사용 금지 (M5에서 invariant 강제 예정)

alter table public.pages
  add column content jsonb,
  add column content_encrypted bytea;

comment on column public.pages.content is
  'BlockNote document JSON (평문). content_encrypted와 동시 사용 금지 (M5 invariant).';
comment on column public.pages.content_encrypted is
  '비공개 모드(M5)에서 editor.document를 DEK로 AES-GCM 암호화한 ciphertext.';
