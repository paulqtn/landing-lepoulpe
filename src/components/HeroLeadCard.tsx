"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, Phone } from "lucide-react";
import { site } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Compact "be called back" lead form in the hero — posts to /api/lead. */
export function HeroLeadCard() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [showErr, setShowErr] = useState(false);

  const errors = {
    name: form.name.trim().length < 2,
    email: !EMAIL_RE.test(form.email),
    phone: form.phone.replace(/\D/g, "").length < 8,
  };
  const invalid = errors.name || errors.email || errors.phone;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) {
      setShowErr(true);
      return;
    }
    setStatus("loading");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "hero-callback" }),
      });
    } catch {
      // keep the UX smooth even on a network hiccup
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="border border-neutral-900 bg-white p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-grotesk text-xl font-bold text-neutral-900">
          Merci, c’est noté !
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Un expert vous rappelle sous 24h pour parler de votre acquisition.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-neutral-900 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-900 px-5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-900">
          Être rappelé · gratuit
        </span>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-neutral-600">
          Laissez vos coordonnées : un expert vous rappelle sous 24h avec un
          premier plan d’action.
        </p>

        <Field
          placeholder="Votre nom"
          autoComplete="name"
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          error={showErr && errors.name}
        />
        <Field
          type="email"
          placeholder="Email professionnel"
          autoComplete="email"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          error={showErr && errors.email}
        />
        <Field
          type="tel"
          placeholder="Téléphone"
          autoComplete="tel"
          value={form.phone}
          onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          error={showErr && errors.phone}
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-poulpe-500 disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
            </>
          ) : (
            <>
              Être rappelé sous 24h
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-400">
            Sans engagement
          </span>
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <Phone className="h-3 w-3" />
            ou appelez-nous
          </a>
        </div>
      </div>
    </form>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-label={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 ${
        error ? "border-poulpe-500" : "border-neutral-300"
      }`}
    />
  );
}
