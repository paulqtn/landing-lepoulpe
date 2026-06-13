const sectors = [
  "E-commerce",
  "Restauration",
  "Santé & bien-être",
  "Immobilier",
  "Artisanat",
  "B2B & services",
  "Tourisme",
  "Startups",
];

export function TrustBar() {
  return (
    <section
      aria-label="Secteurs accompagnés"
      className="border-y border-slate-100 bg-slate-50/60 py-6"
    >
      <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
        Ils déploient leur présence avec Le Poulpe
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="animate-marquee flex w-max gap-4 pr-4">
          {[...sectors, ...sectors].map((sector, i) => (
            <span
              key={`${sector}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-poulpe-400" />
              {sector}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
