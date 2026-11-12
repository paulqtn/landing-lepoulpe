import Image from "next/image";

/**
 * Bandeau « Ils nous ont fait confiance » : références clients qui défilent.
 *
 * Pour remplacer les éléments, éditer la liste passée en `items` :
 *   { name: "Nom du client" }                           → nom en toutes lettres
 *   { name: "Nom du client", logo: "/logos/client.svg" } → logo (fichier dans /public)
 *
 * Chaque référence n'est écrite qu'une fois dans le texte de la page : les
 * copies qui bouclent le défilement sont décoratives (nom en attribut, rendu
 * en CSS ; logos sans texte alternatif).
 */
export type TrustItem = { name: string; logo?: string };

/* Copies du jeu d'éléments : 2 par moitié de boucle, pour couvrir les très
   grands écrans sans trou. */
const COPIES = [0, 1, 2, 3];

export function TrustBar({ title = "Ils nous ont fait confiance", items }: { title?: string; items: TrustItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-neutral-200 bg-white py-10 sm:py-12">
      <h2 className="px-5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-pine-700">
        {title}
      </h2>

      <div className="mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none]">
        <div
          className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none"
          style={{ animationDuration: `${Math.max(40, items.length * 9)}s` }}
        >
          {COPIES.map((copy) => {
            const deco = copy > 0;
            return (
              <ul
                key={copy}
                aria-hidden={deco}
                className={`flex items-center ${
                  deco
                    ? "motion-reduce:hidden"
                    : "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-3 motion-reduce:px-5"
                }`}
              >
                {items.map((item) => (
                  <li
                    key={item.name}
                    className="mr-4 grid h-14 min-w-[9.5rem] place-items-center rounded-xl px-6 sm:mr-6 sm:min-w-[11rem]"
                  >
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={deco ? "" : item.name}
                        width={160}
                        height={48}
                        className="h-9 w-auto max-w-[9rem] object-contain opacity-70 grayscale"
                      />
                    ) : deco ? (
                      <span
                        data-label={item.name}
                        className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight text-neutral-400 after:content-[attr(data-label)]"
                      />
                    ) : (
                      <span className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight text-neutral-400">
                        {item.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      </div>
    </section>
  );
}
