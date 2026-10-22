import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { DASH } from "./dashTokens";

type Props = {
  eyebrow: string;
  greeting: string;
  TimeIcon: LucideIcon;
  subtitle: ReactNode;
  actions?: ReactNode;
  search?: ReactNode;
  snapshot?: ReactNode;
};

export default function DashboardHero({
  eyebrow,
  greeting,
  TimeIcon,
  subtitle,
  actions,
  search,
  snapshot,
}: Props) {
  return (
    <div className={DASH.panelHero}>
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={DASH.eyebrowMuted}>{eyebrow}</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
            {greeting}
            <TimeIcon className="h-6 w-6 text-[#C69259]" aria-hidden />
          </h1>
          <div className="mt-1 text-sm text-[#6B7280]">{subtitle}</div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {search ? <div className="mb-6">{search}</div> : null}
      {snapshot}
    </div>
  );
}
