import type { Metadata } from "next";
import { BackOfficeShell } from "@/components/admin/BackOfficeShell";

export const metadata: Metadata = {
  title: { default: "Back office", template: "%s · Back office" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function CommercialLayout({ children }: { children: React.ReactNode }) {
  return <BackOfficeShell>{children}</BackOfficeShell>;
}
