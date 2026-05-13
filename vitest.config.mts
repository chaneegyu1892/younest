import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // React 컴포넌트 테스트 파일은 .dom.test.{ts,tsx} 확장자로 작성하면 happy-dom 환경 사용.
    // (jsdom 29.x는 html-encoding-sniffer + @exodus/bytes ESM 충돌이 있어 happy-dom으로 전환)
    environmentMatchGlobs: [["**/*.dom.test.{ts,tsx}", "happy-dom"]],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
