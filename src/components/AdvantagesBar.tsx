/**
 * Bandeau sombre défilant sous le hero : avantages produit concrets,
 * volontairement différents des arguments déjà affichés plus haut
 * (devis 24h, sur-mesure, NF P01-012, livraison France).
 */
export function AdvantagesBar({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden bg-pine-950 py-4">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
              {items.map((item) => (
                <span key={item} className="flex items-center">
                  <span className="whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-pine-100">
                    {item}
                  </span>
                  <span
                    className="mx-7 h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500"
                    aria-hidden
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
