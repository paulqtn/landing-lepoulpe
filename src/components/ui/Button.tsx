import { type AnchorHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poulpe-500 focus-visible:ring-offset-2 disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-poulpe-500 text-white shadow-lg shadow-poulpe-500/25 hover:bg-poulpe-600 hover:shadow-poulpe-500/40 hover:-translate-y-0.5",
  secondary:
    "bg-white text-ink ring-1 ring-slate-200 hover:ring-poulpe-300 hover:text-poulpe-600 hover:-translate-y-0.5",
  ghost: "text-ink hover:text-poulpe-600",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

/** A link styled as a button — used for CTAs throughout the landing pages. */
export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
}
