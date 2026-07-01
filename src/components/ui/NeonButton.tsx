"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";

interface NeonButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<string, string> = {
  primary: "bg-foreground text-background font-medium hover:opacity-90",
  secondary:
    "border border-white/15 text-foreground hover:border-white/30 hover:bg-white/[0.03]",
  ghost: "text-muted hover:text-foreground",
};

export function NeonButton({
  children,
  href,
  onClick,
  variant = "primary",
  disabled,
  className,
  type = "button",
  icon,
}: NeonButtonProps) {
  const content = (
    <motion.span
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm tracking-wide transition-colors duration-200",
        VARIANT_STYLES[variant],
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      {icon}
      {children}
    </motion.span>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-block"
    >
      {content}
    </button>
  );
}
