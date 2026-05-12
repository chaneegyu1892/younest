import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      // Supabase Storage 도메인은 Phase 2 이후 환경변수 받은 뒤 추가
    ],
  },
};

export default nextConfig;
