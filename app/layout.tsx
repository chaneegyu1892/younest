import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "younest",
  description: "너만의 디지털 둥지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
