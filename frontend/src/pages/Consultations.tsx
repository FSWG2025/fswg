import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import {
  Calendar,
  Clock,
  User,
  Plus,
  SearchX,
  Video,
  MessageSquare,
  XCircle,
  Loader2,
} from "lucide-react";
import type { Consultation } from "@/types";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";
import { AppCard, AppPage, AppPageHeader } from "@/components/ui/AppCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FILTERS = [
  { id: "scheduled", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const statusLabel: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  approved: "Approved",
  rejected: "Rejected",
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

const Consultations = ({
  defaultFilter = "scheduled",
}: {
  defaultFilter?: string;
}) => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/consultations")
      .then(({ data }) => setConsultations(data.consultations || data || []))
      .catch(() => toast.error("Could not load bookings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setActiveFilter(defaultFilter);
  }, [defaultFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { scheduled: 0, completed: 0, cancelled: 0 };
    for (const item of consultations) {
      if (c[item.status] != null) c[item.status] += 1;
    }
    return c;
  }, [consultations]);

  const filtered = useMemo(
    () =>
      consultations
        .filter((c) => (activeFilter ? c.status === activeFilter : true))
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [consultations, activeFilter]
  );

  const nextUp = useMemo(() => {
    const now = Date.now();
    return consultations
      .filter((c) => c.status === "scheduled" && new Date(c.dateTime).getTime() >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
  }, [consultations]);

  const cancelBooking = async (id: string) => {
    setCancellingId(id);
    try {
      await api.delete(`/consultations/${id}`);
      toast.success("Consultation cancelled");
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not cancel");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <AppPage>
      <AppCard className="mb-5">
        <AppPageHeader
          eyebrow="Bookings"
          title="Consultations"
          description="Schedule discovery calls, track status, and join video when it is time."
          actions={
            user?.role === "client" ? (
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,33,62,0.18)] transition hover:bg-[#0D1A2E] active:scale-[0.98]"
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
                <Plus className="h-4 w-4" /> Book consultation
              </button>
            ) : null
          }
        />
      </AppCard>

      {nextUp && activeFilter === "scheduled" && (
        <AppCard className="mb-5 border-[#E8D5BC] bg-[#FBF4EB]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
            Next up
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#12213E]">
                {nextUp.service?.title || "Consultation"}
              </h2>
              <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#6B7280]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#C69259]" />
                  {formatWhen(nextUp.dateTime).date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#C69259]" />
                  {formatWhen(nextUp.dateTime).time}
                  {nextUp.duration ? ` · ${nextUp.duration} min` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#C69259]" />
                  {nextUp.consultant?.name || "Advisor TBD"}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/app/video"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#12213E] ring-1 ring-[#E5EAF0]"
              >
                <Video className="h-4 w-4 text-[#C69259]" /> Video room
              </Link>
              <Link
                to="/app/messages"
                className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-3 py-2 text-sm font-semibold text-white"
              >
                <MessageSquare className="h-4 w-4" /> Message
              </Link>
            </div>
          </div>
        </AppCard>
      )}

      <AppCard>
        <div className="mb-5 flex flex-wrap gap-2 border-b border-[#E5EAF0] pb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold transition",
                activeFilter === f.id
                  ? "bg-[#12213E] text-white"
                  : "bg-[#F4F6F8] text-[#6B7280] hover:text-[#12213E]"
              )}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{counts[f.id] || 0}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#C69259]" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center">
            <SearchX className="mx-auto h-10 w-10 text-[#C69259]" />
            <p className="mt-4 text-lg font-semibold text-[#12213E]">
              No {FILTERS.find((f) => f.id === activeFilter)?.label.toLowerCase()} consultations
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {activeFilter === "scheduled"
                ? "Book a free discovery call when you are ready."
                : "Items in this view will appear here."}
            </p>
            {user?.role === "client" && activeFilter === "scheduled" && (
              <button
                type="button"
                onClick={() => setBookingModalOpen(true)}
                className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,33,62,0.18)] transition hover:bg-[#0D1A2E] active:scale-[0.98]"
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-[#C69259]" aria-hidden />
                <Plus className="h-4 w-4" /> Book consultation
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <ul className="divide-y divide-[#E5EAF0]">
            {filtered.map((c) => {
              const when = formatWhen(c.dateTime);
              const open = expandedId === c._id;
              return (
                <li key={c._id} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : c._id)}
                    className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#12213E]">
                          {c.service?.title || "Consultation"}
                        </h3>
                        <span className="rounded-md bg-[#F4F6F8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                          {statusLabel[c.status] || c.status}
                        </span>
                      </div>
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6B7280]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#C69259]" />
                          {when.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#C69259]" />
                          {when.time}
                          {c.duration ? ` · ${c.duration} min` : ""}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-[#C69259]" />
                          {c.consultant?.name || "Advisor TBD"}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#C69259]">
                      {open ? "Hide" : "Details"}
                    </span>
                  </button>

                  {open && (
                    <div className="mt-3 space-y-3 rounded-xl bg-[#F7F9FB] p-4 text-sm text-[#6B7280]">
                      {c.interest && (
                        <p>
                          <span className="font-semibold text-[#12213E]">Interest · </span>
                          {c.interest.replace(/_/g, " ")}
                        </p>
                      )}
                      {c.notes ? (
                        <p>
                          <span className="font-semibold text-[#12213E]">Notes · </span>
                          {c.notes}
                        </p>
                      ) : (
                        <p>No notes added for this booking.</p>
                      )}
                      <div className="flex flex-wrap gap-3 pt-1">
                        {c.status === "scheduled" && (
                          <>
                            <Link
                              to="/app/video"
                              className="inline-flex items-center gap-1.5 font-semibold text-[#12213E]"
                            >
                              <Video className="h-3.5 w-3.5 text-[#C69259]" /> Join video
                            </Link>
                            <Link
                              to="/app/messages"
                              className="inline-flex items-center gap-1.5 font-semibold text-[#C69259]"
                            >
                              <MessageSquare className="h-3.5 w-3.5" /> Message
                            </Link>
                            {(user?.role === "client" || user?.role === "admin") && (
                              <button
                                type="button"
                                disabled={cancellingId === c._id}
                                onClick={() => cancelBooking(c._id)}
                                className="inline-flex items-center gap-1.5 font-semibold text-red-600 disabled:opacity-50"
                              >
                                {cancellingId === c._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AppCard>

      <ConsultationBookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          load();
        }}
      />
    </AppPage>
  );
};

export default Consultations;
