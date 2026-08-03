import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingExcludes: {
    '**': [
      './db/**',
      './uploads/**',
      './dev.log',
      './server.log',
      './.git/**',
      './node_modules/.cache/**',
      './tool-results/**',
      './tests/**',
      './examples/**',
      './skills/**',
      './download/**',
      './scripts/**',
    ],
  },
};

export default nextConfig;
