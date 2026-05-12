import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // React 컴포넌트 테스트 파일은 .dom.test.{ts,tsx} 확장자로 작성하면 jsdom 환경 사용
    environmentMatchGlobs: [["**/*.dom.test.{ts,tsx}", "jsdom"]],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
