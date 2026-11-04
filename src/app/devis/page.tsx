import { redirect } from "next/navigation";

/* /devis a fusionné avec le générateur plein écran : redirection
   permanente en conservant les pré-réglages (sys, len, h). */

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const qp = new URLSearchParams();
  for (const key of ["sys", "len", "h", "usage", "verre"]) {
    if (sp[key]) qp.set(key, String(sp[key]));
  }
  redirect(`/generateur${qp.size ? `?${qp.toString()}` : ""}`);
}
