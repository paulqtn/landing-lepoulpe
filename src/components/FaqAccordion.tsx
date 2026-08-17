"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { QA } from "@/lib/catalog";

export function FaqAccordion({ faq }: { faq: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition-colors ${isOpen ? "border-pine-300 bg-pine-50/50" : "border-neutral-200 bg-white"}`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-bold text-inkgreen">{item.q}</span>
              <Plus className={`h-5 w-5 shrink-0 text-pine-600 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
