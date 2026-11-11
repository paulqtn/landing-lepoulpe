/** Commerciaux (séparés par des virgules dans ADMIN_TEAM, ex. "Alexandre,Sophie").
    Sans variable, une équipe de démonstration permet de tester le multi-vendeur. */
export function getTeam(): string[] {
  const env = (process.env.ADMIN_TEAM ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return env.length > 0 ? env : ["Sophie", "Karim"];
}
