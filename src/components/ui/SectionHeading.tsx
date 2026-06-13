import { type ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Eyebrow + title + optional intro, shared by every section. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
}) {
  const alignment =
    align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <Reveal className={`flex max-w-2xl flex-col ${alignment}`}>
      {eyebrow && (
        <span
          className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            dark
              ? "bg-white/10 text-poulpe-300"
              : "bg-poulpe-50 text-poulpe-700"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-poulpe-500" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl font-extrabold sm:text-4xl md:text-[2.75rem] md:leading-[1.1] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
