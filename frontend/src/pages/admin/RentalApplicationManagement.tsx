import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import CustomPagination from "@/components/global/CustomPagination";
import { Eye, FileText, User } from "lucide-react";
import type { RentalApplication } from "@/types";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import RentalApplicationDetailDialog from "@/features/admin/rentals/RentalApplicationDetailDialog";
import { useAuth } from "@/hooks/AuthProvider";
import { APPROVE_APPLICATION_ROLES, hasRole } from "@/lib/roles";

const STAFF_STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "info_requested", label: "Info Requested" },
  { value: "cancelled", label: "Cancelled" },
];

const ADMIN_STATUS_OPTIONS = [
  ...STAFF_STATUS_OPTIONS,
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  info_requested: "bg-purple-100 text-purple-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const RentalApplicationManagement = () => {
  const { user } = useAuth();
  const canApprove = hasRole(user?.role, APPROVE_APPLICATION_ROLES);
  const statusOptions = useMemo(
    () => (canApprove ? ADMIN_STATUS_OPTIONS : STAFF_STATUS_OPTIONS),
    [canApprove],
  );

  const [apps, setApps] = useState<RentalApplication[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<RentalApplication | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [publicComment, setPublicComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/rental-applications?page=${page}&limit=10`,
      );
      setApps(data.applications);
      setTotalPages(data.pagination.pages);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [page]);

  const updateStatus = async (id: string, status: string) => {
    try {
      if (
        (status === "approved" || status === "rejected") &&
        !canApprove
      ) {
        toast.error("Only admins can approve or reject applications");
        return;
      }
      if (status === "rejected" && !rejectionReason.trim()) {
        toast.error("Please provide a rejection reason.");
        return;
      }
      await api.patch(`/rental-applications/${id}`, {
        status,
        reason:
          status === "rejected" || status === "approved"
            ? rejectionReason.trim()
            : undefined,
      });
      toast.success("Status updated");
      setRejectionReason("");
      fetchApps();
      setDetailOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const addInternalNote = async () => {
    if (!selectedApp || !internalNote.trim()) return;
    try {
      await api.patch(`/rental-applications/${selectedApp._id}`, {
        internalNotes: `[${new Date().toISOString().slice(0, 16)}] ${internalNote}`,
      });
      toast.success("Internal note added");
      setInternalNote("");
      fetchApps();
      setDetailOpen(false);
    } catch {
      toast.error("Failed to add note");
    }
  };

  const addPublicComment = async () => {
    if (!selectedApp || !publicComment.trim()) return;
    try {
      await api.patch(`/rental-applications/${selectedApp._id}`, {
        comments: `[${new Date().toISOString().slice(0, 16)}] ${publicComment}`,
      });
      toast.success("Comment added");
      setPublicComment("");
      fetchApps();
      setDetailOpen(false);
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const requestDecision = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a decision reason for the admin.");
      return;
    }
    const app = apps.find((a) => a._id === id) || selectedApp;
    const name = app?.personalInfo?.fullName || "Applicant";
    try {
      await api.post("/approvals", {
        type: status === "approved" ? "rental_approve" : "rental_reject",
        resourceType: "rental_application",
        resourceId: id,
        title:
          status === "approved"
            ? `Approve rental: ${name}`
            : `Reject rental: ${name}`,
        summary: rejectionReason.trim(),
        payload: { reason: rejectionReason.trim(), status },
      });
      toast.success("Sent to admin approval queue");
      setRejectionReason("");
      setDetailOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit approval request",
      );
    }
  };

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={DASH.panelHero}
      >
        <p className={DASH.eyebrowMuted}>Rental guarantee</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
          Rental Applications
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Review and manage rental guarantee applications.
        </p>
      </motion.div>

      <div className={DASH.panel}>
        {loading && apps.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6B7280]">
            Loading applications…
          </p>
        ) : apps.length === 0 ? (
          <div className="rounded-2xl bg-[#F7FBFE] py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-[#C69259]/50" />
            <p className="mt-3 text-sm font-semibold text-[#12213E]">
              No applications found
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {apps.map((app, i) => (
              <motion.li
                key={app._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.03 }}
                className="rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-4 transition hover:border-[#C69259]/35 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-white">
                        <User className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#12213E]">
                          {app.personalInfo?.fullName || "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6B7280]">
                          {app.employment?.employerName || "No employer"}
                          {" · "}$
                          {app.employment?.monthlyIncome?.toLocaleString() ||
                            "0"}
                          /mo
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${statusColors[app.status] || statusColors.submitted}`}
                      >
                        {app.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#9CA3AF] sm:ml-11">
                      Submitted{" "}
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:w-[200px] sm:shrink-0">
                    <Select
                      value={app.status}
                      onValueChange={(val) => updateStatus(app._id, val)}
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl border-[#E5EAF0] bg-white text-xs font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setDetailOpen(true);
                      }}
                      className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white text-xs font-semibold text-[#12213E] transition hover:border-[#C69259]/40"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View details
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}

        <div className="mt-5">
          <CustomPagination
            loading={loading}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      </div>

      <RentalApplicationDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        app={selectedApp}
        canApprove={canApprove}
        internalNote={internalNote}
        setInternalNote={setInternalNote}
        publicComment={publicComment}
        setPublicComment={setPublicComment}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onAddInternalNote={addInternalNote}
        onAddPublicComment={addPublicComment}
        onUpdateStatus={updateStatus}
        onRequestDecision={requestDecision}
      />
    </DashboardShell>
  );
};

export default RentalApplicationManagement;
