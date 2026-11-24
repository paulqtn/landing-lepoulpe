import { adminQuery as q, dbConfigured } from "./db";

/** Personnes à qui un client peut être attribué : les comptes actifs du back office. */
export async function getTeam(): Promise<string[]> {
  if (!dbConfigured) return [];
  const rows = await q<{ name: string }>("SELECT name FROM users WHERE active ORDER BY name");
  return rows.map((r) => r.name);
}
