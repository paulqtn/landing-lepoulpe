import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — garde-corps verre, alu & inox en direct usine`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "garde-corps",
    "garde-corps verre",
    "garde-corps aluminium",
    "garde-corps inox",
    "garde-corps sur-mesure",
    "garde-corps kit",
    "balustrade",
    "rambarde",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — garde-corps en direct usine`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#175a3b",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
