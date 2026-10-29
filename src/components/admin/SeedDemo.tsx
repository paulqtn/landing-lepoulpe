"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2 } from "lucide-react";

export function SeedDemo() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await fetch("/api/admin/seed-demo", { method: "POST" });
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-500 transition hover:border-pine-400 hover:text-pine-700 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
      Créer des leads de démo
    </button>
  );
}
