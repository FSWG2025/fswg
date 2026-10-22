import { Pin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import type { Lead } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  noteText: string;
  onNoteTextChange: (v: string) => void;
  editingNoteIndex: number | null;
  pinnedNoteIndex: number | null;
  onPin: (idx: number | null) => void;
  onEdit: (idx: number, note: string) => void;
  onDelete: (idx: number) => void;
  onSave: () => void;
};

export default function LeadNotesDialog({
  open,
  onOpenChange,
  lead,
  noteText,
  onNoteTextChange,
  editingNoteIndex,
  pinnedNoteIndex,
  onPin,
  onEdit,
  onDelete,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Notes · {lead?.firstName} {lead?.lastName}
          </DialogTitle>
          <DialogDescription>
            Keep follow-up context on this lead.
          </DialogDescription>
        </DialogHeader>
        {lead && (
          <div className="space-y-3">
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {(lead.notes || []).length === 0 ? (
                <p className="rounded-xl bg-[#F7FBFE] px-3 py-6 text-center text-xs text-[#6B7280]">
                  No notes yet
                </p>
              ) : (
                lead.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between gap-2 rounded-xl p-3 ${
                      pinnedNoteIndex === idx
                        ? "border border-amber-200 bg-amber-50"
                        : "bg-[#F7FBFE]"
                    }`}
                  >
                    <p className="flex-1 text-sm text-[#374151]">{note}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(idx, note)}
                        className="text-[11px] font-semibold text-[#3B82F6]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(idx)}
                        className="text-[11px] font-semibold text-red-500"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onPin(pinnedNoteIndex === idx ? null : idx)
                        }
                        className={
                          pinnedNoteIndex === idx
                            ? "text-amber-500"
                            : "text-[#9CA3AF]"
                        }
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={noteText}
                onChange={(e) => onNoteTextChange(e.target.value)}
                className="flex-1 rounded-xl border border-[#E5EAF0] px-3 py-2.5 text-sm outline-none focus:border-[#C69259]/50"
                placeholder="Add note…"
              />
              <button type="button" onClick={onSave} className={DASH.primaryBtn}>
                {editingNoteIndex !== null ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
