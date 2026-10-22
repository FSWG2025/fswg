import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "@/lib/api";
import type { RentalApplication } from "@/types";
import {
  Plus,
  FileText,
  Calendar,
  Building2,
  Clock,
  MapPin,
  FolderLock,
  Home,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { AppCard, AppPage, AppPageHeader } from "@/components/ui/AppCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Submitted" },
  { id: "under_review", label: "In review" },
  { id: "info_requested", label: "Info needed" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

const statusCopy: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  info_requested: "Info requested",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const pipeline = ["submitted", "under_review", "info_requested", "approved"] as const;

function pipelineIndex(status: string) {
  if (status === "approved") return 3;
  if (status === "info_requested") return 2;
  if (status === "under_review") return 1;
  if (status === "rejected" || status === "cancelled") return -1;
  return 0;
}

const RentalApplications = () => {
  const [apps, setApps] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/rental-applications")
      .then(({ data }) => setApps(data.applications || data || []))
      .catch(() => toast.error("Could not load applications"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const f of FILTERS) {
      if (f.id === "all") continue;
      c[f.id] = apps.filter((a) => a.status === f.id).length;
    }
    return c;
  }, [apps]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? apps : apps.filter((a) => a.status === filter);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [apps, filter]);

  const activeCount = apps.filter((a) =>
    ["submitted", "under_review", "info_requested"].includes(a.status)
  ).length;

  if (loading) {
    return (
      <AppPage>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#C69259]" />
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppCard className="mb-5">
        <AppPageHeader
          eyebrow="Rental support"
          title="Applications"
          description="Track rental guarantee requests, document updates, and advisor feedback."
          actions={
            <button
              type="button"
              onClick={() => navigate("/rental-applications/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> New application
            </button>
          }
        />
      </AppCard>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: apps.length, label: "Total", sub: "All applications" },
          { value: activeCount, label: "In progress", sub: "Awaiting review or info" },
          { value: counts.approved || 0, label: "Approved", sub: "Ready for next steps" },
        ].map((m) => (
          <AppCard key={m.label}>
            <p className="text-3xl font-extrabold tracking-tight text-[#12213E]">{m.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#12213E]">{m.label}</p>
            <p className="text-xs text-[#6B7280]">{m.sub}</p>
          </AppCard>
        ))}
        <AppCard className="flex flex-col justify-center gap-3">
          <Link
            to="/app/housing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#12213E]"
          >
            <Home className="h-3.5 w-3.5 text-[#C69259]" /> Housing prefs
          </Link>
          <Link
            to="/app/documents"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C69259]"
          >
            <FolderLock className="h-3.5 w-3.5" /> Document vault
          </Link>
        </AppCard>
      </div>

      <AppCard>
        <div className="mb-5 flex flex-wrap gap-2 border-b border-[#E5EAF0] pb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                filter === f.id
                  ? "bg-[#12213E] text-white"
                  : "bg-[#F4F6F8] text-[#6B7280] hover:text-[#12213E]"
              )}
            >
              {f.label}
              <span className="ml-1 opacity-70">{counts[f.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-[#C69259]" />
            <p className="mt-4 text-lg font-semibold text-[#12213E]">
              {apps.length === 0 ? "No applications yet" : "Nothing in this filter"}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {apps.length === 0
                ? "Start a rental guarantee application when you are ready."
                : "Try another status or view all applications."}
            </p>
            {apps.length === 0 && (
              <button
                type="button"
                onClick={() => navigate("/rental-applications/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" /> Start application
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[#E5EAF0]">
            {filtered.map((app) => {
              const open = expandedId === app._id;
              const step = pipelineIndex(app.status);
              return (
                <li key={app._id} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : app._id)}
                    className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#12213E]">
                          {app.personalInfo?.fullName || "Application"}
                        </h3>
                        <span className="rounded-md bg-[#F4F6F8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                          {statusCopy[app.status] || app.status}
                        </span>
                      </div>
                      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#6B7280]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#C69259]" />
                          {app.createdAt
                            ? new Date(app.createdAt).toLocaleDateString()
                            : "-"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#C69259]" />
                          {app.employment?.employerName || "No employer"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#C69259]" />
                          {app.employment?.employmentType?.replace("-", " ") || "-"}
                        </span>
                      </p>
                      {step >= 0 && (
                        <div className="mt-3 flex max-w-sm items-center gap-1">
                          {pipeline.map((p, i) => (
                            <div
                              key={p}
                              className={cn(
                                "h-1.5 flex-1 rounded-full",
                                i <= step ? "bg-[#12213E]" : "bg-[#E5EAF0]"
                              )}
                              title={statusCopy[p]}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C69259]">
                      {open ? "Hide" : "Details"}
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
                      />
                    </span>
                  </button>

                  {open && (
                    <div className="mt-3 space-y-4 rounded-xl bg-[#F7F9FB] p-4 text-sm">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            Contact
                          </p>
                          <p className="mt-1 font-medium text-[#12213E]">
                            {app.personalInfo?.email || "-"}
                          </p>
                          <p className="text-[#6B7280]">{app.personalInfo?.phone || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            Address
                          </p>
                          <p className="mt-1 inline-flex items-start gap-1.5 text-[#12213E]">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C69259]" />
                            {app.personalInfo?.currentAddress || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            Employment
                          </p>
                          <p className="mt-1 text-[#12213E]">
                            {app.employment?.position || "-"} ·{" "}
                            {app.employment?.monthlyIncome != null
                              ? `$${app.employment.monthlyIncome}/mo`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            References / docs
                          </p>
                          <p className="mt-1 text-[#12213E]">
                            {app.references?.length || 0} reference
                            {(app.references?.length || 0) === 1 ? "" : "s"} ·{" "}
                            {app.documents?.length || 0} document
                            {(app.documents?.length || 0) === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      {app.comments?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            Advisor updates
                          </p>
                          <ul className="mt-2 space-y-1 text-[#6B7280]">
                            {app.comments.map((c, i) => (
                              <li key={i}>· {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4">
                        <Link to="/app/documents" className="font-semibold text-[#12213E]">
                          Upload supporting docs →
                        </Link>
                        <Link to="/app/messages" className="font-semibold text-[#C69259]">
                          Ask about this application →
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </AppCard>
    </AppPage>
  );
};

export default RentalApplications;
