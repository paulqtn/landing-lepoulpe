/* ================================================================== */
/*  Menus du back office et droits d'accès par utilisateur.            */
/*  Le super-administrateur voit tout. Pour les autres comptes, il     */
/*  coche menu par menu ce qui est accessible ; le rôle ne fournit que */
/*  la sélection de départ. Les droits sont vérifiés côté serveur, sur */
/*  les pages ET sur les API — masquer un lien ne suffit pas.          */
/*  Fichier sans dépendance serveur : utilisable aussi dans l'écran.   */
/* ================================================================== */

export const MENU_KEYS = [
  "etat", "devis", "clients", "relances", "pipeline", "production", "stats", "simulation", "messagerie",
  "logistique", "commandes", "stock", "expeditions",
  "tarifs", "diagnostic",
] as const;
export type MenuKey = (typeof MENU_KEYS)[number];

export const MENUS: { key: MenuKey; label: string; href: string; group: "commercial" | "logistique" | "administration"; exact?: boolean }[] = [
  { key: "etat", label: "État des lieux", href: "/commercial", group: "commercial", exact: true },
  { key: "devis", label: "Devis à traiter", href: "/commercial/devis", group: "commercial" },
  { key: "clients", label: "Clients", href: "/commercial/clients", group: "commercial" },
  { key: "relances", label: "Relances", href: "/commercial/relances", group: "commercial" },
  { key: "pipeline", label: "Vue Kanban", href: "/commercial/pipeline", group: "commercial" },
  { key: "production", label: "Production", href: "/commercial/production", group: "commercial" },
  { key: "stats", label: "Statistiques", href: "/commercial/stats", group: "commercial" },
  { key: "simulation", label: "Simulation", href: "/commercial/simulation", group: "commercial" },
  { key: "messagerie", label: "Messagerie intelligente", href: "/commercial/messagerie", group: "commercial" },
  { key: "logistique", label: "Tâches du jour", href: "/logistique", group: "logistique", exact: true },
  { key: "commandes", label: "Commandes atelier", href: "/logistique/commandes", group: "logistique" },
  { key: "stock", label: "Stock", href: "/logistique/stock", group: "logistique" },
  { key: "expeditions", label: "Expéditions", href: "/logistique/expeditions", group: "logistique" },
  { key: "tarifs", label: "Tarifs et paramètres", href: "/commercial/admin/tarifs", group: "administration" },
  { key: "diagnostic", label: "Diagnostic", href: "/commercial/admin/diagnostic", group: "administration" },
];

type Role = "superadmin" | "admin" | "commercial" | "logisticien";

const LOGISTIQUE: MenuKey[] = ["logistique", "commandes", "stock", "expeditions"];
const COMMERCIAL: MenuKey[] = ["etat", "devis", "clients", "relances", "pipeline", "production", "stats", "simulation", "messagerie"];

/** Sélection de départ selon le rôle, tant que rien n'a été personnalisé. */
export const ROLE_MENUS: Record<Role, MenuKey[]> = {
  superadmin: [...MENU_KEYS],
  admin: [...MENU_KEYS],
  commercial: COMMERCIAL,
  logisticien: LOGISTIQUE,
};

export const GROUP_LABELS = { commercial: "Espace commercial", logistique: "Espace logistique", administration: "Administration" } as const;
/** Menus qui donnent le droit d'agir sur les commandes, le stock et les expéditions. */
export const LOGISTICS_KEYS: MenuKey[] = ["logistique", "commandes", "stock", "expeditions"];

export function sanitizeMenus(raw: unknown): MenuKey[] | null {
  if (!Array.isArray(raw)) return null;
  return MENU_KEYS.filter((k) => raw.includes(k));
}

/** Menus réellement accessibles : tout pour le super-administrateur, sinon la sélection du compte. */
export function effectiveMenus(role: Role, menus: unknown): MenuKey[] {
  if (role === "superadmin") return [...MENU_KEYS];
  return sanitizeMenus(menus) ?? ROLE_MENUS[role];
}
