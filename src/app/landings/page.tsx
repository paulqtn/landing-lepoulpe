import { redirect } from "next/navigation";

// The hub now lives at the site root; keep /landings working for old links.
export default function LandingsRedirect() {
  redirect("/");
}
