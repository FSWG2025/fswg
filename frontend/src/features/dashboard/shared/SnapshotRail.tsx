import type { ReactNode } from "react";

type Props = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Unused: kept for call-site compatibility; layout is flex-fill (no empty tracks). */
  columnsClassName?: string;
};

/**
 * Snapshot metrics as a wrapping flex row.
 * Cards grow (`flex-1`) so the last row never leaves an empty “rail gap”.
 */
export default function SnapshotRail({
  title = "Your snapshot",
  action,
  children,
}: Props) {
  return (
    <div id="dash-snapshot" className="scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#12213E]">{title}</h2>
        {action}
      </div>
      <div className="flex w-full flex-wrap gap-3">{children}</div>
    </div>
  );
}
