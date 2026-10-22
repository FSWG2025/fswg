import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CustomPagination from "@/components/global/CustomPagination";

type ApprovalRequest = {
  _id: string;
  type: string;
  resourceType: string;
  resourceId: string;
  title: string;
  summary: string;
  payload?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requestedBy?: { name?: string; email?: string; role?: string };
  reviewedBy?: { name?: string; email?: string };
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
};

const TYPE_LABELS: Record<string, string> = {
  rental_approve: "Approve rental",
  rental_reject: "Reject rental",
  advisor_approve: "Approve advisor",
  advisor_reject: "Reject advisor",
  advisor_enroll: "Enroll advisor",
  user_delete: "Delete user",
  user_role_change: "Change role",
  user_deactivate: "Deactivate user",
};

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-gray-50 text-gray-600 ring-gray-200",
};

const ApprovalsQueue = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/approvals", {
        params: {
          page,
          limit: 10,
          status: tab === "pending" ? "pending" : "all",
        },
      });
      setRequests(data.requests || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const decide = async (id: string, decision: "approve" | "reject") => {
    setBusyId(id);
    try {
      await api.patch(`/approvals/${id}/${decision}`, {
        note: notes[id]?.trim() || undefined,
      });
      toast.success(
        decision === "approve" ? "Action approved and executed" : "Request declined",
      );
      setNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not update request");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id: string) => {
    setBusyId(id);
    try {
      await api.delete(`/approvals/${id}`);
      toast.success("Request cancelled");
      fetchRequests();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not cancel");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell>
      <div className={DASH.container}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={DASH.panelHero}
        >
          <p className={DASH.eyebrow}>Governance</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
            Approval queue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            {isAdmin
              ? "Critical actions from staff wait here until you sign off. Approving runs the action immediately."
              : "Track the critical decisions you submitted for admin sign-off."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(["pending", "all"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={tab === t ? DASH.activeTab : DASH.ghostTab}
              >
                {t === "pending" ? "Pending" : "All history"}
              </button>
            ))}
          </div>
        </motion.div>

        <div className={`${DASH.panel} mt-5`}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#6B7280]">
              <Loader2 className="h-5 w-5 animate-spin text-[#C69259]" />
              Loading requests…
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl bg-[#F7FBFE] px-6 py-14 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-[#C69259]" />
              <p className="mt-3 text-sm font-semibold text-[#12213E]">
                {tab === "pending" ? "Nothing waiting" : "No requests yet"}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                When staff request rental/advisor decisions or sensitive user
                changes, they appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li
                  key={r._id}
                  className="rounded-2xl border border-[#E8ECF1] bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${statusTone[r.status]}`}
                        >
                          {r.status === "pending" ? (
                            <Clock3 className="h-3 w-3" />
                          ) : r.status === "approved" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {r.status}
                        </span>
                        <span className="rounded-full bg-[#F7FBFE] px-2.5 py-0.5 text-[11px] font-semibold text-[#12213E]">
                          {TYPE_LABELS[r.type] || r.type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#12213E]">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#6B7280]">{r.summary}</p>
                      <p className="mt-2 text-xs text-[#9CA3AF]">
                        Requested by{" "}
                        <span className="font-semibold text-[#12213E]">
                          {r.requestedBy?.name || "Unknown"}
                        </span>
                        {r.requestedBy?.role ? ` · ${r.requestedBy.role}` : ""}
                        {" · "}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      {r.reviewNote ? (
                        <p className="mt-2 rounded-xl bg-[#F7FBFE] px-3 py-2 text-xs text-[#6B7280]">
                          Review note: {r.reviewNote}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {r.status === "pending" && isAdmin ? (
                    <div className="mt-4 space-y-3 border-t border-[#EEF2F6] pt-4">
                      <Textarea
                        placeholder="Optional note for the requester…"
                        rows={2}
                        value={notes[r._id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({
                            ...prev,
                            [r._id]: e.target.value,
                          }))
                        }
                        className="text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={busyId === r._id}
                          onClick={() => decide(r._id, "approve")}
                          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {busyId === r._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Approve & execute
                        </Button>
                        <Button
                          disabled={busyId === r._id}
                          variant="destructive"
                          onClick={() => decide(r._id, "reject")}
                          className="rounded-xl"
                        >
                          <XCircle className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {r.status === "pending" && !isAdmin ? (
                    <div className="mt-4 border-t border-[#EEF2F6] pt-4">
                      <Button
                        variant="outline"
                        disabled={busyId === r._id}
                        onClick={() => cancel(r._id)}
                        className="rounded-xl"
                      >
                        Cancel request
                      </Button>
                    </div>
                  ) : null}
                </li>
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
      </div>
    </DashboardShell>
  );
};

export default ApprovalsQueue;
