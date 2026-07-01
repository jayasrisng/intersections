import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function GlassCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("glass-card rounded-2xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}
