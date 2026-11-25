"use client";

import { usePathname } from "next/navigation";

/* L'en-tête et le pied du site public ne s'affichent pas dans le back office. */
export function HorsBackOffice({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  if (/^\/(commercial|logistique)(\/|$)/.test(path)) return null;
  return <>{children}</>;
}
