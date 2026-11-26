/* Numéros de téléphone : mise au format international (E.164) attendu par la téléphonie,
   et comparaison de deux numéros écrits différemment. Aucune dépendance. */

/** « 06 12 34 56 78 », « 0033 6… », « +33 (0)6… » → « +33612345678 ». null si le numéro n'est pas exploitable. */
export function versE164(brut: string | null | undefined): string | null {
  let s = String(brut ?? "").trim();
  if (!s) return null;
  s = s.replace(/\(0\)/g, "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (s.startsWith("+")) {
    const n = s.slice(1).replace(/\D/g, "");
    return n.length >= 8 && n.length <= 15 ? `+${n}` : null;
  }
  // Numéro français à 10 chiffres commençant par 0.
  if (/^0\d{9}$/.test(s)) return `+33${s.slice(1)}`;
  // Numéro français saisi sans le 0 (9 chiffres) : accepté pour les mobiles et fixes courants.
  if (/^[1-9]\d{8}$/.test(s)) return `+33${s}`;
  return null;
}

/** Les 9 derniers chiffres : même client, que le numéro soit écrit 06…, +336… ou 00336… */
export const cleNumero = (brut: string | null | undefined): string => String(brut ?? "").replace(/\D/g, "").slice(-9);

export const memeNumero = (a: string | null | undefined, b: string | null | undefined): boolean => {
  const x = cleNumero(a);
  return x.length >= 8 && x === cleNumero(b);
};

/** « +33612345678 » → « 06 12 34 56 78 » pour l'affichage (inchangé si non français). */
export function numeroLisible(e164: string | null | undefined): string {
  const s = String(e164 ?? "");
  const m = /^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(s);
  return m ? `0${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}` : s;
}

export function dureeLisible(secondes: number): string {
  const s = Math.max(0, Math.round(secondes));
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}`;
}
