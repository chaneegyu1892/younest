/**
 * PBKDF2-SHA256 600,000 iterations. PRD §8.8 — 변경 금지 (Danger Zone).
 *
 * 흐름: PIN → MK (PBKDF2) → MK로 DEK를 wrap → 서버 저장은 wrappedDek + salt.
 * 본 모듈은 클라이언트 전용. PIN/MK는 절대 서버 전송 금지.
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 32;

export async function deriveMasterKey(
  pin: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}
