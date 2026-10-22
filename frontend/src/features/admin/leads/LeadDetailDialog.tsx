import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Lead } from "@/types";
import { formatInterest, leadInitials, leadStatusClass } from "./leadStatus";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
};

export default function LeadDetailDialog({ open, onOpenChange, lead }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Lead details</DialogTitle>
        </DialogHeader>
        {lead && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-[#F7FBFE] p-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-sm font-bold text-white">
                {leadInitials(lead.firstName, lead.lastName)}
              </span>
              <div>
                <p className="font-bold text-[#12213E]">
                  {lead.firstName} {lead.lastName}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${leadStatusClass(lead.status)}`}
                >
                  {lead.status}
                </span>
              </div>
            </div>
            {[
              ["Email", lead.email],
              ["Phone", lead.phone || "-"],
              ["Interest", formatInterest(lead.interest)],
              ["Source", String(lead.source || "-").replace(/_/g, " ")],
              ["Assigned", lead.assignedConsultant?.name || "Unassigned"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between gap-3 border-b border-[#F3F4F6] py-2 last:border-0"
              >
                <span className="text-xs font-semibold text-[#9CA3AF]">
                  {label}
                </span>
                <span className="text-right font-semibold capitalize text-[#12213E]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
