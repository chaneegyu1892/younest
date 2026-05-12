import { describe, it, expect } from "vitest";
import {
  encryptString,
  decryptString,
  generateDek,
} from "@/lib/crypto/aes-gcm";

describe("aes-gcm", () => {
  it("encrypt → decrypt 라운드트립이 원본을 복원한다", async () => {
    const dek = await generateDek();
    const plaintext = "안녕하세요, younest!";
    const encrypted = await encryptString(plaintext, dek);
    const decrypted = await decryptString(encrypted, dek);
    expect(decrypted).toBe(plaintext);
  });

  it("BlockNote document JSON 라운드트립이 동작한다", async () => {
    const dek = await generateDek();
    const doc = [
      {
        id: "1",
        type: "paragraph",
        content: [{ type: "text", text: "테스트" }],
      },
      { id: "2", type: "heading", props: { level: 1 }, content: "헤더" },
    ];
    const json = JSON.stringify(doc);
    const encrypted = await encryptString(json, dek);
    const decrypted = await decryptString(encrypted, dek);
    expect(JSON.parse(decrypted)).toEqual(doc);
  });

  it("다른 DEK로는 복호화에 실패한다", async () => {
    const dek1 = await generateDek();
    const dek2 = await generateDek();
    const encrypted = await encryptString("secret", dek1);
    await expect(decryptString(encrypted, dek2)).rejects.toThrow();
  });

  it("같은 평문도 IV가 매번 달라 ciphertext가 달라진다", async () => {
    const dek = await generateDek();
    const a = await encryptString("hello", dek);
    const b = await encryptString("hello", dek);
    expect(Array.from(a.iv)).not.toEqual(Array.from(b.iv));
  });
});
