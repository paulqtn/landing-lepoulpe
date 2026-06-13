import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/sea/audit-sea-gratuit",
        destination: "/ads/audit-google-ads",
        permanent: true,
      },
      {
        source: "/sea/generation-de-leads",
        destination: "/ads/generation-de-leads",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
