import type { ReactNode } from "react";
import clsx from "clsx";

export function PageShell({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main
      className={clsx(
        "mx-auto w-full flex-1 px-6 py-16 sm:py-20",
        wide ? "max-w-5xl" : "max-w-2xl",
        className
      )}
    >
      {children}
    </main>
  );
}
