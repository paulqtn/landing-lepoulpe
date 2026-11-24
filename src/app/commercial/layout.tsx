import type { Metadata } from "next";
import { BackOfficeShell } from "@/components/admin/BackOfficeShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Espace commercial — ${site.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  return <BackOfficeShell>{children}</BackOfficeShell>;
}
