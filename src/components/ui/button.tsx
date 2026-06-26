"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "border-brand bg-brand px-5 py-3 text-white hover:bg-brand-strong hover:border-brand-strong",
        secondary:
          "border-border-strong bg-white/80 px-5 py-3 text-foreground hover:bg-white",
        ghost: "border-transparent bg-transparent px-4 py-3 text-muted hover:bg-brand-soft/60",
        danger:
          "border-danger bg-danger px-5 py-3 text-white hover:opacity-90",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}
