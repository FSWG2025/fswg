import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AppCard, AppPage, AppPageHeader } from "@/components/ui/AppCard";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
};

/** Professional page shell with header card + content surface. */
export default function ClientToolShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  actions,
}: Props) {
  return (
    <AppPage>
      <AppCard className="mb-5">
        <AppPageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            <div className="flex items-center gap-3">
              <span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#12213E]/5 text-[#C69259] sm:flex">
                <Icon className="h-5 w-5" />
              </span>
              {actions}
            </div>
          }
        />
      </AppCard>
      <AppCard>{children}</AppCard>
    </AppPage>
  );
}
