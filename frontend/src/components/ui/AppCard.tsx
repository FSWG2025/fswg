import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared surface for dashboards and client tools.
 * Clean professional card: soft border, light shadow, consistent radius.
 * Parent AppPage is 98% of the screen; cards fill that column.
 */
export function AppCard({
  className,
  children,
  padded = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-[#E5EAF0] bg-white shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)]",
        padded && "p-5 sm:p-6",
        className
      )}

      {...props}
    >
      {children}
    </div>
  );
}

export function AppPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** @deprecated Pages use 98% width; kept for call-site compatibility */
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-[#EEF2F6]">
      <div
        className={cn(
          "mx-auto w-[98%] space-y-5 py-5 sm:py-6 md:py-8",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7280]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AppSectionTitle({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center justify-between gap-2", className)}>
      <h2 className="text-base font-bold text-[#12213E] sm:text-lg">{title}</h2>
      {action}
    </div>
  );
}
