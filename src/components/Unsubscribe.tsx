"use client";

import { useState } from "react";

export function Unsubscribe({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  return (
    <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-7 text-center shadow-card">
      <h1 className="text-xl font-extrabold text-inkgreen">Se désinscrire de nos e-mails d&rsquo;information</h1>
      {state === "done" ? (
        <p className="mt-3 text-sm text-neutral-600">C&rsquo;est fait : vous ne recevrez plus nos e-mails d&rsquo;information. Les messages liés à un devis en cours restent possibles.</p>
      ) : (
        <>
          <p className="mt-3 text-sm text-neutral-600">Confirmez pour ne plus recevoir nos e-mails d&rsquo;information.</p>
          <button
            type="button"
            disabled={state === "busy"}
            onClick={async () => {
              setState("busy");
              const res = await fetch(`/api/desabonnement/${token}`, { method: "POST" }).catch(() => null);
              setState(res?.ok ? "done" : "error");
            }}
            className="mt-5 rounded-full bg-pine-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-pine-600 disabled:opacity-40"
          >
            Confirmer ma désinscription
          </button>
          {state === "error" && <p role="alert" className="mt-3 text-xs font-semibold text-red-600">Ce lien n&rsquo;est plus valable. Répondez « stop » à l&rsquo;un de nos e-mails et nous nous en occupons.</p>}
        </>
      )}
    </div>
  );
}
