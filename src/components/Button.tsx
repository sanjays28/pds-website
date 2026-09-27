import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn, omit } from "@/lib/utils";

/**
 * Button — WMS §8 contract: "CTA per 13.3 · variants: primary(green pill)/
 * ghost(green line)/compact(nav)/text · props: variant,size,icon,loading,
 * asChild · a11y: min 44px, loading=aria-busy+spinner-needle · motion M17".
 *
 * FLAG: the WMS's `asChild` prop implies a Radix-style slot primitive
 * (render-as-child-element). Not wired here — this component always
 * renders its own `<a>`/`<button>`; `href` decides which. Revisit if a
 * later section genuinely needs to compose Button styling onto a foreign
 * element rather than just linking or clicking.
 */

type Variant = "primary" | "ghost" | "compact" | "text";
type Size = "md" | "sm";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsLink = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;
type ButtonAsButton = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  ghost: "btn btn-ghost",
  compact: "btn-compact",
  text: "btn-text",
};

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", loading, className, children } = props;
  const classes = cn(variantClass[variant], size === "sm" && "btn-sm", className);

  if ("href" in props && props.href) {
    const rest = omit(props, ["href", "variant", "size", "loading", "className", "children"]);
    return (
      <Link href={props.href} className={classes} aria-busy={loading || undefined} {...rest}>
        <span className="btn-label">{children}</span>
        {variant !== "text" && <span className="arrow" aria-hidden="true">→</span>}
      </Link>
    );
  }

  const rest = omit(props as ButtonAsButton, ["href", "variant", "size", "loading", "className", "children"]);
  return (
    <button className={classes} aria-busy={loading || undefined} {...rest}>
      <span className="btn-label">{children}</span>
      {variant !== "text" && <span className="arrow" aria-hidden="true">→</span>}
    </button>
  );
}
