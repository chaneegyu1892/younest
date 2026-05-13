/**
 * Postgres ILIKE 메타문자 (%, _, \) escape.
 * 사용자 입력을 ILIKE 패턴에 안전하게 삽입하기 위해 사용.
 */
export function escapeIlike(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}
