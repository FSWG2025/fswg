import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  File,
  FileText,
  Lock,
  MessageSquare,
  User,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { RentalApplication } from "@/types";
import { isPdfPath, uploadFilename } from "@/lib/uploadUrl";
import InAppPdfViewer from "@/components/global/InAppPdfViewer";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: RentalApplication | null;
  canApprove?: boolean;
  internalNote: string;
  setInternalNote: (v: string) => void;
  publicComment: string;
  setPublicComment: (v: string) => void;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  onAddInternalNote: () => void;
  onAddPublicComment: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  /** Staff: submit approve/reject for admin sign-off */
  onRequestDecision?: (id: string, status: "approved" | "rejected") => void;
};

/** Mobile: short steps so Decision never floods the viewport. */
const MOBILE_STEPS = [
  { id: "personal", label: "Info" },
  { id: "employment", label: "Work" },
  { id: "docs", label: "Docs" },
  { id: "notes", label: "Notes" },
  { id: "decide", label: "Decide" },
] as const;

export default function RentalApplicationDetailDialog({
  open,
  onOpenChange,
  app,
  canApprove = false,
  internalNote,
  setInternalNote,
  publicComment,
  setPublicComment,
  rejectionReason,
  setRejectionReason,
  onAddInternalNote,
  onAddPublicComment,
  onUpdateStatus,
  onRequestDecision,
}: Props) {
  const isDesktop = useMediaQuery(breakpoints.md);
  const [step, setStep] = useState(0);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  useEffect(() => {
    if (open) setStep(0);
  }, [open, app?._id]);

  const maxStep = MOBILE_STEPS.length - 1;
  const showPager = !isDesktop;
  const docs = useMemo(() => app?.documents || [], [app]);

  if (!app) return null;

  const personal = (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#12213E]">
        <User className="h-4 w-4 text-[#C69259]" /> Personal information
      </h3>
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#F7FBFE] p-3 sm:grid-cols-2 sm:p-4">
        {[
          ["Full name", app.personalInfo?.fullName],
          [
            "Date of birth",
            app.personalInfo?.dob
              ? new Date(app.personalInfo.dob).toLocaleDateString()
              : "-",
          ],
          ["Email", app.personalInfo?.email],
          ["Phone", app.personalInfo?.phone],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <p className="text-xs text-[#6B7280]">{label}</p>
            <p className="break-all text-sm font-medium text-[#12213E]">
              {value || "-"}
            </p>
          </div>
        ))}
        <div className="sm:col-span-2">
          <p className="text-xs text-[#6B7280]">Current address</p>
          <p className="text-sm font-medium text-[#12213E]">
            {app.personalInfo?.currentAddress || "-"}
          </p>
        </div>
      </div>
    </div>
  );

  const employment = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#12213E]">
          <Building2 className="h-4 w-4 text-[#C69259]" /> Employment
        </h3>
        <div className="grid grid-cols-1 gap-3 rounded-xl bg-[#F7FBFE] p-3 sm:grid-cols-2 sm:p-4">
          {[
            ["Employer", app.employment?.employerName],
            ["Position", app.employment?.position],
            [
              "Monthly income",
              app.employment?.monthlyIncome != null
                ? `$${app.employment.monthlyIncome.toLocaleString()}`
                : "-",
            ],
            [
              "Employment type",
              app.employment?.employmentType?.replace(/-/g, " "),
            ],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <p className="text-xs capitalize text-[#6B7280]">{label}</p>
              <p className="text-sm font-medium capitalize text-[#12213E]">
                {value || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
      {app.references?.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#12213E]">
            <UsersIcon className="h-4 w-4 text-[#C69259]" /> References
          </h3>
          <div className="space-y-2">
            {app.references.map((ref, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-0.5 rounded-xl bg-[#F7FBFE] p-3"
              >
                <span className="text-sm font-semibold text-[#12213E]">
                  {ref.name}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {ref.relationship} · {ref.phone}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const documents = (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#12213E]">
        <File className="h-4 w-4 text-[#C69259]" /> Uploaded documents
      </h3>
      {docs.length === 0 ? (
        <p className="rounded-xl bg-[#F7FBFE] px-3 py-6 text-center text-xs text-[#6B7280]">
          No documents uploaded
        </p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#E8ECF1] bg-[#F7FBFE] p-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-[#C69259]" />
                <span className="truncate text-sm font-medium text-[#12213E]">
                  {uploadFilename(doc)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPdfSrc(doc)}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#12213E] px-3 py-2 text-xs font-semibold text-white"
              >
                <Eye className="h-3.5 w-3.5" />
                {isPdfPath(doc) ? "View PDF" : "View"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const notes = (
    <div className="space-y-4">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#12213E]">
          <Lock className="h-4 w-4 text-red-500" /> Internal notes
        </h4>
        {app.internalNotes?.length ? (
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto rounded-xl bg-[#F7FBFE] p-3 text-xs text-[#6B7280]">
            {app.internalNotes.map((n, i) => (
              <li key={i} className="border-b border-[#EEF2F6] pb-1 last:border-0">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-[#9CA3AF]">No internal notes yet</p>
        )}
        <div className="mt-2 flex gap-2">
          <Textarea
            placeholder="Add note…"
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={2}
            className="min-h-0 flex-1 text-sm"
          />
          <Button
            onClick={onAddInternalNote}
            size="sm"
            className="shrink-0 self-end bg-[#12213E] text-white hover:bg-[#0D1A2E]"
          >
            Add
          </Button>
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-2 text-sm font-bold text-[#12213E]">
          <MessageSquare className="h-4 w-4 text-[#C69259]" /> Public comment
        </h4>
        {app.comments?.length ? (
          <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto rounded-xl bg-[#F7FBFE] p-3 text-xs text-[#6B7280]">
            {app.comments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-2 flex gap-2">
          <Textarea
            placeholder="Visible to applicant…"
            value={publicComment}
            onChange={(e) => setPublicComment(e.target.value)}
            rows={2}
            className="min-h-0 flex-1 text-sm"
          />
          <Button
            onClick={onAddPublicComment}
            size="sm"
            className="shrink-0 self-end bg-[#C69259] text-white hover:bg-[#B07D4A]"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  const decide = (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-bold text-[#12213E]">
        <AlertTriangle className="h-4 w-4 text-red-500" /> Decision
      </h4>
      <p className="text-xs text-[#6B7280]">
        {canApprove
          ? "Admin: add a reason, then approve or reject immediately."
          : "Recommend a decision for admin sign-off. The application status will not change until an admin approves your request."}
      </p>
      <Textarea
        placeholder="Decision reason (required)…"
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        rows={3}
        className="w-full text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() =>
            canApprove
              ? onUpdateStatus(app._id, "approved")
              : onRequestDecision?.(app._id, "approved")
          }
          className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          {canApprove ? "Approve" : "Request approve"}
        </Button>
        <Button
          onClick={() =>
            canApprove
              ? onUpdateStatus(app._id, "rejected")
              : onRequestDecision?.(app._id, "rejected")
          }
          variant="destructive"
          className="flex items-center justify-center gap-1.5"
        >
          <XCircle className="h-4 w-4" />
          {canApprove ? "Reject" : "Request reject"}
        </Button>
      </div>
    </div>
  );

  const mobilePanels = [personal, employment, documents, notes, decide];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1rem)] max-w-[700px] flex-col gap-0 overflow-hidden rounded-[24px] p-0 sm:w-full">
          <DialogHeader className="shrink-0 border-b border-[#F3F4F6] px-4 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="flex items-center gap-2 text-base text-[#12213E] sm:text-lg">
              <FileText className="h-5 w-5 text-[#C69259]" /> Application details
            </DialogTitle>
            {showPager && (
              <div className="mt-2 flex flex-wrap gap-1">
                {MOBILE_STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStep(i)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                      step === i
                        ? "bg-[#12213E] text-white"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4">
            {showPager ? (
              mobilePanels[step]
            ) : (
              <div className="space-y-6">
                {personal}
                {employment}
                {documents}
                {notes}
                {decide}
              </div>
            )}
          </div>

          {showPager && (
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#F3F4F6] px-4 py-2.5">
              <button
                type="button"
                disabled={step <= 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-[#E8ECF1] px-3 py-2 text-xs font-semibold text-[#374151] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-[11px] font-semibold tabular-nums text-[#9CA3AF]">
                {step + 1}/{MOBILE_STEPS.length}
              </span>
              <button
                type="button"
                disabled={step >= maxStep}
                onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
                className="inline-flex items-center gap-1 rounded-xl bg-[#12213E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <InAppPdfViewer src={pdfSrc} onClose={() => setPdfSrc(null)} />
    </>
  );
}
