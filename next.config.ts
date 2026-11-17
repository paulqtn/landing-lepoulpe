import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /* Adresses dédiées de certaines pages du catalogue (voir CUSTOM_PATHS
     dans src/lib/catalog.ts) : la nouvelle adresse sert la page existante,
     l'ancienne y redirige définitivement. */
  async redirects() {
    return [
      { source: "/garde-corps/piscine", destination: "/barriere-piscine-verre", permanent: true },
      // Catalogue recentré sur le verre : pages matériaux et combinaisons dépubliées.
      { source: "/garde-corps/verre", destination: "/garde-corps", permanent: true },
      { source: "/garde-corps/aluminium", destination: "/garde-corps", permanent: true },
      { source: "/garde-corps/inox", destination: "/garde-corps", permanent: true },
      { source: "/garde-corps/verre-:usage", destination: "/garde-corps/:usage", permanent: true },
      { source: "/garde-corps/aluminium-:usage", destination: "/garde-corps/:usage", permanent: true },
      { source: "/garde-corps/inox-:usage", destination: "/garde-corps/:usage", permanent: true },
    ];
  },
  async rewrites() {
    return [{ source: "/barriere-piscine-verre", destination: "/garde-corps/piscine" }];
  },
};

export default nextConfig;
