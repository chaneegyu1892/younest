/**
 * AES-GCM 256bit 암호화 유틸.
 * PRD §8: 평문 콘텐츠/DEK는 절대 서버 전송 금지. 본 모듈은 클라이언트 전용.
 *
 * IV는 매 암호화마다 새로 생성 (12 byte 권장).
 */

export interface EncryptedPayload {
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
}

export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(
  plaintext: string,
  key: CryptoKey,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plaintext),
  );
  return { iv, ciphertext };
}

export async function decryptString(
  payload: EncryptedPayload,
  key: CryptoKey,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.iv as BufferSource },
    key,
    payload.ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}
