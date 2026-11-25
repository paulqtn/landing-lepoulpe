/* Dates à l'heure de Paris — calcul pur, sans dépendance (testé par npm test). */

const PARIS = "Europe/Paris";
const parisParts = (d: Date) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: PARIS, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), h: Number(p.hour) };
};

/** Instant correspondant à `heure` h 00, heure de Paris, `jours` jours après `from` (heure d'été gérée). */
export function dateParis(from: Date, jours: number, heure: number): Date {
  const t = parisParts(from);
  const cible = new Date(Date.UTC(t.y, t.m - 1, t.d + jours)); // jour civil visé
  let guess = Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth(), cible.getUTCDate(), heure);
  for (let i = 0; i < 3; i++) {
    const p = parisParts(new Date(guess));
    const vu = Date.UTC(p.y, p.m - 1, p.d, p.h);
    const voulu = Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth(), cible.getUTCDate(), heure);
    if (vu === voulu) break;
    guess += voulu - vu;
  }
  return new Date(guess);
}

/** Fin de la journée en cours, heure de Paris (sert quand la tâche ne passe qu'une fois par jour). */
export function finDeJourneeParis(now = new Date()): Date {
  return new Date(dateParis(now, 1, 0).getTime() - 1000);
}
