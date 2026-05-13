/**
 * BlockNote document JSON ↔ DB 컬럼 추상화 레이어.
 *
 * M2.2 (현재): plain 분기만 사용. encrypted는 항상 null.
 * M5 (미래): 비공개 모드에서 encrypted 분기 추가. 호출부는 변경 0.
 */

export type SerializedContent = {
  plain: unknown[] | null;
  encrypted: Uint8Array | null;
};

/**
 * BlockNote editor.document (또는 null = 신규/빈 페이지)를
 * DB에 저장할 형태로 직렬화.
 *
 * M2.2: opts 미사용. M5: opts.dek 전달 시 encrypted 분기.
 */
export function serializeContent(
  doc: unknown[] | null,
  _opts?: { dek?: CryptoKey }
): SerializedContent {
  return { plain: doc, encrypted: null };
}

/**
 * DB row를 BlockNote editor.document 형태로 역직렬화.
 *
 * M2.2: plain만 처리. encrypted가 들어있으면 빈 페이지로 폴백 + 경고.
 * M5: opts.dek 전달 시 encrypted 복호화.
 */
export function deserializeContent(
  row: SerializedContent,
  _opts?: { dek?: CryptoKey }
): unknown[] | null {
  if (row.encrypted && !row.plain) {
    console.warn(
      "[content-codec] encrypted content present but no DEK provided (M5 미구현). 빈 페이지로 폴백."
    );
    return null;
  }
  return row.plain;
}
