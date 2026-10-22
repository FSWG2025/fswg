import type { ReactNode } from "react";
import { DASH } from "./dashTokens";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className={DASH.page}>
      <div className={DASH.container}>{children}</div>
    </div>
  );
}
