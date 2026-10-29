/** Commerciaux (séparés par des virgules dans ADMIN_TEAM, ex. "Alexandre,Sophie"). */
export function getTeam(): string[] {
  return (process.env.ADMIN_TEAM ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
