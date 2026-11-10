import { redirect } from "next/navigation";

/* L'ancien back office unifié a été scindé en espaces dédiés :
   /commercial aujourd'hui, /logistique et /admin (gérant) à venir. */
export default function AdminRedirect() {
  redirect("/commercial");
}
