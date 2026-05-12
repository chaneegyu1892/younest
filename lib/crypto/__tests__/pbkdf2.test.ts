import { describe, it, expect } from "vitest";
import { deriveMasterKey, generateSalt } from "@/lib/crypto/pbkdf2";
import {
  encryptString,
  decryptString,
  generateDek,
} from "@/lib/crypto/aes-gcm";

describe("pbkdf2", () => {
  it("같은 PIN+salt는 같은 키를 유도한다 (wrap/unwrap 라운드트립)", async () => {
    const pin = "1234";
    const salt = generateSalt();
    const mk1 = await deriveMasterKey(pin, salt);
    const mk2 = await deriveMasterKey(pin, salt);

    const plaintext = "DEK wrap test";
    const encrypted = await encryptString(plaintext, mk1);
    const decrypted = await decryptString(encrypted, mk2);
    expect(decrypted).toBe(plaintext);
  });

  it("다른 salt면 다른 키가 유도된다", async () => {
    const pin = "1234";
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const mk1 = await deriveMasterKey(pin, salt1);
    const mk2 = await deriveMasterKey(pin, salt2);

    const encrypted = await encryptString("hello", mk1);
    await expect(decryptString(encrypted, mk2)).rejects.toThrow();
  });

  it("MK로 wrap한 DEK 결과(ciphertext)를 다른 PIN으로는 풀 수 없다", async () => {
    const salt = generateSalt();
    const mkCorrect = await deriveMasterKey("right-pin", salt);
    const mkWrong = await deriveMasterKey("wrong-pin", salt);

    // DEK는 raw bytes로 export해서 MK로 암호화하는 식. 단순화: DEK 문자열을 MK로 암호화.
    const dek = await generateDek();
    const dekBytes = await crypto.subtle.exportKey("raw", dek);
    const dekBase64 = btoa(
      String.fromCharCode(...new Uint8Array(dekBytes)),
    );
    const wrapped = await encryptString(dekBase64, mkCorrect);

    await expect(decryptString(wrapped, mkWrong)).rejects.toThrow();
  });

  it("salt는 매번 32 bytes 새로 생성된다", () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).toHaveLength(32);
    expect(b).toHaveLength(32);
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });
});
