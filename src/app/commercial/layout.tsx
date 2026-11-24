import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { CommercialNav } from "@/components/admin/CommercialNav";
import { ROLE_LABELS, countUsers, currentUser, setupTokenConfigured } from "@/lib/admin/auth";
import { dbConfigured } from "@/lib/admin/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Espace commercial — ${site.name}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommercialLayout({ children }: { children: React.ReactNode }) {
  const gate = (node: React.ReactNode) => <main className="grid min-h-[70vh] place-items-center bg-mist px-5 py-16">{node}</main>;

  if (!dbConfigured) return gate(<AdminLogin mode="nodb" />);

  const user = await currentUser();
  if (!user) {
    let users: number;
    try {
      users = await countUsers();
    } catch (e) {
      return gate(<AdminLogin mode="dberror" detail={e instanceof Error ? e.message : undefined} />);
    }
    if (users === 0) return gate(<AdminLogin mode={setupTokenConfigured() ? "setup" : "setup-token-missing"} />);
    return gate(<AdminLogin mode="login" />);
  }

  return (
    <main className="min-h-screen bg-mist">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-neutral-200 bg-white p-3">
            <p className="px-3 pb-1 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Espace commercial
            </p>
            <p className="mx-3 mb-2 inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-xs font-bold text-pine-800" title={ROLE_LABELS[user.role]}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {user.name}
            </p>
            <CommercialNav role={user.role} />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 md:hidden">
            <CommercialNav role={user.role} compact />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
