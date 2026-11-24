import { adminQuery as q, dbConfigured } from "./db";

/* Paramètres administrables (table settings) — lus avec un cache court. */

const TTL_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();

export async function getSetting<T>(key: string): Promise<T | null> {
  if (!dbConfigured) return null;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T | null;
  try {
    const rows = await q<{ value: T }>("SELECT value FROM settings WHERE key = $1", [key]);
    const value = rows[0]?.value ?? null;
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (e) {
    console.error("[settings] lecture impossible :", e);
    return (hit?.value as T | undefined) ?? null;
  }
}

export async function setSetting(key: string, value: unknown, actor: string): Promise<void> {
  await q(
    `INSERT INTO settings (key, value, updated_by) VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by`,
    [key, JSON.stringify(value), actor],
  );
  cache.delete(key);
}
