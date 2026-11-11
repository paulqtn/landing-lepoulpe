import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /* Adresses dédiées de certaines pages du catalogue (voir CUSTOM_PATHS
     dans src/lib/catalog.ts) : la nouvelle adresse sert la page existante,
     l'ancienne y redirige définitivement. */
  async redirects() {
    return [{ source: "/garde-corps/piscine", destination: "/barriere-piscine-verre", permanent: true }];
  },
  async rewrites() {
    return [{ source: "/barriere-piscine-verre", destination: "/garde-corps/piscine" }];
  },
};

export default nextConfig;
