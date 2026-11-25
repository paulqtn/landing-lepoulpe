import vercel from "../../../vercel.json";

/* La fréquence de la tâche de relance se lit dans vercel.json : dès que son
   planning passe en horaire (champ « heure » à *), les heures d'envoi choisies
   dans l'onglet Relances sont respectées — sans autre changement de code. */
const schedule = vercel.crons.find((c) => c.path === "/api/admin/cron/relances")?.schedule ?? "";

export const CRON_HORAIRE = schedule.trim().split(/\s+/)[1] === "*";

/** Heure de passage quotidien (UTC) quand la tâche n'est pas horaire. */
export const CRON_HEURE_UTC = CRON_HORAIRE ? null : Number(schedule.trim().split(/\s+/)[1]);
