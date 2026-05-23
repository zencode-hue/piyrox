import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow builds to succeed even with type errors in edge cases
  typescript: {
    ignoreBuildErrors: false,
  },
  // eslint config was removed in Next.js 16 - use eslint.config.mjs instead
};

export default nextConfig;
