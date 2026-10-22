import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleDelete: () => void | Promise<void>;
  title: string;
  description: string;
  /** Shown as a highlighted chip under the description */
  entityLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
}

const CustomAlert = ({
  isOpen,
  setIsOpen,
  handleDelete,
  title,
  description,
  entityLabel,
  confirmLabel = "Delete permanently",
  cancelLabel = "Keep it",
  tone = "danger",
}: Props) => {
  const [busy, setBusy] = useState(false);
  const isDanger = tone === "danger";

  const onConfirm = async () => {
    try {
      setBusy(true);
      await handleDelete();
      setIsOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (busy) return;
        setIsOpen(open);
      }}
    >
      <AlertDialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-[28px] border-[#E8ECF1] p-0 shadow-[0_24px_64px_rgba(18,33,62,0.18)]">
        <div
          className={
            isDanger
              ? "border-b border-red-100 bg-gradient-to-br from-[#FFF5F5] via-white to-white px-6 pb-5 pt-6"
              : "border-b border-[#F0E4D4] bg-gradient-to-br from-[#FBF4EB] via-white to-white px-6 pb-5 pt-6"
          }
        >
          <div
            className={
              isDanger
                ? "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100"
                : "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5E6D3] text-[#9A6B3A] ring-1 ring-[#E8D5BC]"
            }
          >
            {isDanger ? (
              <Trash2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-[#12213E]">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-[#6B7280]">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {entityLabel ? (
            <div className="mt-4 rounded-2xl border border-[#E8ECF1] bg-white/90 px-3.5 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                Target
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-[#12213E]">
                {entityLabel}
              </p>
            </div>
          ) : null}

          <ul className="mt-4 space-y-1.5 text-xs text-[#6B7280]">
            <li className="flex gap-2">
              <span
                className={
                  isDanger ? "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" : "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C69259]"
                }
              />
              This action cannot be undone.
            </li>
            <li className="flex gap-2">
              <span
                className={
                  isDanger ? "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" : "mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C69259]"
                }
              />
              Related history stays in the audit log.
            </li>
          </ul>
        </div>

        <AlertDialogFooter className="flex-col gap-2 bg-[#F7FBFE] px-6 py-4 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={busy}
            className="m-0 h-11 w-full rounded-2xl border-[#E5EAF0] bg-white font-semibold text-[#12213E] hover:bg-white sm:w-auto sm:px-5"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={
              isDanger
                ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] px-5 text-sm font-semibold text-white transition hover:bg-[#B91C1C] disabled:opacity-60 sm:w-auto"
                : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#12213E] px-5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E] disabled:opacity-60 sm:w-auto"
            }
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isDanger ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {confirmLabel}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlert;
