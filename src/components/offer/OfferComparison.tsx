import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Offer } from "@/lib/offer";

function Value({ v, primary }: { v: boolean | string; primary: boolean }) {
  if (typeof v === "boolean") {
    return v ? (
      <Check className={`mx-auto h-5 w-5 ${primary ? "text-poulpe-600" : "text-poulpe-500"}`} />
    ) : (
      <X className="mx-auto h-5 w-5 text-slate-300" />
    );
  }
  return (
    <span className={primary ? "font-semibold text-poulpe-700" : "text-slate-500"}>
      {v}
    </span>
  );
}

export function OfferComparison({
  comparison,
}: {
  comparison: Offer["comparison"];
}) {
  const { columns, rows } = comparison;

  return (
    <section id="comparatif" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={comparison.eyebrow} title={comparison.title} />

        <Reveal className="mt-12">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="w-[28%] p-4" />
                  {columns.map((c, i) => (
                    <th
                      key={c}
                      className={`p-4 text-center text-sm font-bold ${
                        i === 0
                          ? "rounded-t-2xl bg-poulpe-500 text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => {
                  const last = r === rows.length - 1;
                  return (
                    <tr key={row.label}>
                      <td className="border-t border-slate-100 p-4 text-left text-sm font-medium text-ink">
                        {row.label}
                      </td>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`p-4 text-center text-sm ${
                            i === 0
                              ? `border-t border-poulpe-100 bg-poulpe-50 ${
                                  last ? "rounded-b-2xl" : ""
                                }`
                              : "border-t border-slate-100"
                          }`}
                        >
                          <Value v={v} primary={i === 0} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
