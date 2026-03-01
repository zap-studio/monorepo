"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const BASE =
  "group inline-flex items-center justify-center gap-2 rounded-md font-medium leading-none select-none " +
  "transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background " +
  "disabled:pointer-events-none disabled:opacity-50";

const SIZES = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

type Size = keyof typeof SIZES;

interface PrimaryButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
  href: string;
  size?: Size;
  withArrow?: boolean;
}

export function PrimaryButton({
  children,
  href,
  size = "md",
  withArrow = false,
  className = "",
  ...props
}: PrimaryButtonProps): ReactNode {
  return (
    <Link
      className={[
        BASE,
        SIZES[size],
        "border border-fd-primary/80 bg-fd-primary text-fd-primary-foreground",
        "shadow-sm",
        "hover:-translate-y-px hover:shadow-md hover:brightness-110",
        "active:translate-y-0 active:shadow-sm active:brightness-95",
        className,
      ].join(" ")}
      href={href}
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.18)",
      }}
      {...props}
    >
      {children}
      {withArrow && (
        <ArrowRightIcon className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

interface SecondaryButtonProps extends ComponentPropsWithoutRef<typeof Link> {
  children: ReactNode;
  href: string;
  size?: Size;
}

export function SecondaryButton({
  children,
  href,
  size = "md",
  className = "",
  ...props
}: SecondaryButtonProps): ReactNode {
  return (
    <Link
      className={[
        BASE,
        SIZES[size],
        "border border-fd-border bg-fd-background text-fd-foreground shadow-sm",
        "hover:-translate-y-px hover:border-fd-border/70 hover:bg-fd-accent hover:shadow-md",
        "active:translate-y-0 active:shadow-sm",
        className,
      ].join(" ")}
      href={href}
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.06)",
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({
  children,
  className = "",
}: ButtonGroupProps): ReactNode {
  return (
    <div
      className={`flex w-full flex-row items-center gap-3 sm:w-auto sm:gap-3 ${className}`}
    >
      {children}
    </div>
  );
}
