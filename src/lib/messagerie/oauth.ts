/* Connexion sécurisée par le fournisseur (OAuth 2.0) pour Gmail et Microsoft. Active seulement
   si l'application correspondante est déclarée chez le fournisseur et ses identifiants placés
   dans les variables d'environnement. Les jetons sont chiffrés en base, jamais envoyés à l'écran. */

export type OAuthFournisseur = "google" | "microsoft";

const CONF = {
  google: {
    id: () => process.env.GOOGLE_OAUTH_CLIENT_ID,
    secret: () => process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    auth: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    scope: "https://mail.google.com/ openid email",
    extra: { access_type: "offline", prompt: "consent" },
  },
  microsoft: {
    id: () => process.env.MICROSOFT_OAUTH_CLIENT_ID,
    secret: () => process.env.MICROSOFT_OAUTH_CLIENT_SECRET,
    auth: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/SMTP.Send offline_access openid email profile",
    extra: { prompt: "select_account" },
  },
} as const;

export const estOAuth = (v: string): v is OAuthFournisseur => v === "google" || v === "microsoft";
export const oauthConfigure = (f: OAuthFournisseur) => Boolean(CONF[f].id() && CONF[f].secret());
export const redirection = (origine: string, f: OAuthFournisseur) => `${origine}/api/admin/messagerie/oauth/${f}/callback`;

export function urlAutorisation(f: OAuthFournisseur, state: string, origine: string, adresse?: string): string {
  const c = CONF[f];
  const p = new URLSearchParams({ client_id: c.id() ?? "", redirect_uri: redirection(origine, f), response_type: "code", scope: c.scope, state, ...c.extra, ...(adresse ? { login_hint: adresse } : {}) });
  return `${c.auth}?${p}`;
}

export type Jetons = { access: string; refresh: string | null; expire: number; email: string | null };

async function demander(f: OAuthFournisseur, corps: Record<string, string>): Promise<Jetons> {
  const c = CONF[f];
  const res = await fetch(c.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: c.id() ?? "", client_secret: c.secret() ?? "", ...corps }),
    signal: AbortSignal.timeout(15_000),
  });
  const d = (await res.json().catch(() => ({}))) as { access_token?: string; refresh_token?: string; expires_in?: number; id_token?: string; error?: string; error_description?: string };
  if (!res.ok || !d.access_token) throw new Error(d.error === "invalid_grant" ? "L'autorisation a expiré ou a été retirée : reconnectez la boîte mail." : `Le fournisseur a refusé la connexion (${d.error ?? res.status}).`);
  let email: string | null = null;
  try {
    // Le jeton d'identité vient directement du fournisseur, par TLS : on lit seulement l'adresse.
    const charge = JSON.parse(Buffer.from((d.id_token ?? "").split(".")[1] ?? "", "base64url").toString("utf8")) as { email?: string; preferred_username?: string };
    email = (charge.email ?? charge.preferred_username ?? "").toLowerCase() || null;
  } catch {}
  return { access: d.access_token, refresh: d.refresh_token ?? null, expire: Date.now() + (Number(d.expires_in) || 3000) * 1000, email };
}

export const echangerCode = (f: OAuthFournisseur, code: string, origine: string) => demander(f, { grant_type: "authorization_code", code, redirect_uri: redirection(origine, f) });
export const rafraichir = (f: OAuthFournisseur, refresh: string) => demander(f, { grant_type: "refresh_token", refresh_token: refresh, ...(f === "microsoft" ? { scope: CONF.microsoft.scope } : {}) });

/** Retire l'accès chez le fournisseur à la déconnexion (Google ; Microsoft n'offre pas d'appel équivalent, les jetons sont seulement effacés). */
export async function revoquer(f: OAuthFournisseur, jeton: string): Promise<void> {
  if (f !== "google") return;
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(jeton)}`, { method: "POST", signal: AbortSignal.timeout(8000) }).catch(() => undefined);
}
