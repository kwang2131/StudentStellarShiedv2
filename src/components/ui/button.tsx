"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "border-brand bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))] px-5 py-3 text-white shadow-[0_18px_38px_rgba(0,89,199,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(0,89,199,0.34)]",
        secondary:
          "border-white/80 bg-white/86 px-5 py-3 text-foreground shadow-[0_10px_24px_rgba(8,20,42,0.08)] hover:-translate-y-0.5 hover:bg-white",
        ghost:
          "border-transparent bg-transparent px-4 py-3 text-muted hover:bg-brand-soft/60 hover:text-foreground",
        danger:
          "border-danger bg-danger px-5 py-3 text-white shadow-[0_18px_34px_rgba(201,60,60,0.22)] hover:-translate-y-0.5 hover:opacity-95",
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
