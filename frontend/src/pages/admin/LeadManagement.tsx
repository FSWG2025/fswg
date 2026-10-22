import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Search,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Lead, User } from "@/types";
import CustomPagination from "@/components/global/CustomPagination";
import EmailModal from "@/components/global/EmailModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import LeadDetailDialog from "@/features/admin/leads/LeadDetailDialog";
import LeadNotesDialog from "@/features/admin/leads/LeadNotesDialog";
import {
  formatInterest,
  leadInitials,
  leadStatusClass,
  LEAD_STATUSES,
} from "@/features/admin/leads/leadStatus";

interface Props {
  defaultStatus?: string;
}

const FILTERS = [
  { id: "all", label: "All leads", href: "/admin/leads" },
  { id: "new", label: "New", href: "/admin/leads/new" },
  { id: "converted", label: "Converted", href: "/admin/leads/converted" },
] as const;

export default function LeadManagement({ defaultStatus = "all" }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [consultants, setConsultants] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState(defaultStatus);
  const [query, setQuery] = useState("");

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedLeadNotes, setSelectedLeadNotes] = useState<Lead | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [pinnedNoteIndex, setPinnedNoteIndex] = useState<number | null>(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (activeStatus !== "all") params.set("status", activeStatus);
      const { data } = await api.get(`/leads?${params.toString()}`);
      setLeads(data.leads || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || data.leads?.length || 0);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveStatus(defaultStatus);
    setPage(1);
  }, [defaultStatus]);

  useEffect(() => {
    fetchLeads();
  }, [page, activeStatus]);

  useEffect(() => {
    api
      .get("/users?role=consultant")
      .then(({ data }) => setConsultants(data.users || []))
      .catch(() => setConsultants([]));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [
        l.firstName,
        l.lastName,
        l.email,
        l.phone,
        l.interest,
        l.source,
        l.status,
        l.assignedConsultant?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [leads, query]);

  const stats = useMemo(() => {
    const newCount = leads.filter((l) => l.status === "new").length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    const converted = leads.filter((l) => l.status === "converted").length;
    const assigned = leads.filter((l) => l.assignedConsultant).length;
    return { newCount, qualified, converted, assigned };
  }, [leads]);

  const assignConsultant = async (leadId: string, consultantId: string) => {
    await api.patch(`/leads/${leadId}`, {
      assignedConsultant:
        !consultantId || consultantId === "unassigned" ? null : consultantId,
    });
    toast.success("Assigned");
    fetchLeads();
  };

  const updateStatus = async (leadId: string, status: string) => {
    await api.patch(`/leads/${leadId}`, { status });
    toast.success("Status updated");
    fetchLeads();
  };

  const convertLead = async (leadId: string) => {
    try {
      await api.patch(`/leads/${leadId}/convert`);
      toast.success("Lead converted to client");
      fetchLeads();
    } catch {
      toast.error("Conversion failed");
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      await api.delete(`/leads/${leadId}`);
      toast.success("Lead deleted");
      fetchLeads();
    } catch {
      toast.error("Deletion failed");
    }
  };

  const openNotes = (lead: Lead) => {
    setSelectedLeadNotes(lead);
    setNotesDialogOpen(true);
    setNoteText("");
    setEditingNoteIndex(null);
    setPinnedNoteIndex(null);
  };

  const handleAddOrUpdateNote = async () => {
    if (!selectedLeadNotes || !noteText.trim()) return;
    const updatedNotes = [...(selectedLeadNotes.notes || [])];
    if (editingNoteIndex !== null) {
      updatedNotes[editingNoteIndex] = noteText;
    } else {
      updatedNotes.push(`[${new Date().toLocaleString()}] ${noteText}`);
    }
    await api.patch(`/leads/${selectedLeadNotes._id}`, { notes: updatedNotes });
    toast.success("Note saved");
    setSelectedLeadNotes({ ...selectedLeadNotes, notes: updatedNotes });
    fetchLeads();
    setNoteText("");
    setEditingNoteIndex(null);
  };

  const handleDeleteNote = async (index: number) => {
    if (!selectedLeadNotes) return;
    const updatedNotes = selectedLeadNotes.notes.filter((_, i) => i !== index);
    await api.patch(`/leads/${selectedLeadNotes._id}`, { notes: updatedNotes });
    toast.success("Note deleted");
    setSelectedLeadNotes({ ...selectedLeadNotes, notes: updatedNotes });
    fetchLeads();
  };

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={DASH.panelHero}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={DASH.eyebrowMuted}>Pipeline · CRM</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
              Leads
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[#6B7280]">
              Capture, assign, and convert First Step prospects: from first
              touch to client.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads…"
              className="w-full rounded-2xl border border-[#E5EAF0] bg-[#F7FBFE] py-2.5 pl-10 pr-3 text-sm text-[#12213E] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:bg-white"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              to={f.href}
              className={
                activeStatus === f.id
                  ? DASH.activeTab
                  : "rounded-full border border-[#E5EAF0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#12213E] transition hover:border-[#C69259]/40"
              }
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <SnapshotRail title="This page">
            <SnapshotCard
              index={0}
              label="On page"
              value={total || leads.length}
              sub="Loaded in current view"
              icon={Users}
            />
            <SnapshotCard
              index={1}
              label="New"
              value={stats.newCount}
              sub="Awaiting first touch"
              icon={Target}
            />
            <SnapshotCard
              index={2}
              label="Qualified"
              value={stats.qualified}
              sub="Ready to advance"
              icon={TrendingUp}
            />
            <SnapshotCard
              index={3}
              label="Converted"
              value={stats.converted}
              sub={`${stats.assigned} assigned on page`}
              icon={UserCheck}
            />
          </SnapshotRail>
        </div>
      </motion.div>

      <div className={DASH.panel}>
        <div className="mb-4">
          <p className={DASH.eyebrow}>Directory</p>
          <h2 className={`mt-1 ${DASH.title}`}>
            {visible.length} {visible.length === 1 ? "lead" : "leads"}
          </h2>
        </div>

        {loading && visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6B7280]">
            Loading leads…
          </p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-[#F7FBFE] py-14 text-center">
            <Target className="mx-auto h-8 w-8 text-[#C69259]/50" />
            <p className="mt-3 text-sm font-semibold text-[#12213E]">
              No leads found
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Try another filter or clear your search.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {visible.map((lead, i) => (
              <motion.li
                key={lead._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
                className="flex flex-col gap-3 rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-3.5 transition hover:-translate-y-0.5 hover:border-[#C69259]/35 hover:bg-white lg:flex-row lg:items-center lg:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-sm font-bold text-white shadow-sm">
                    {leadInitials(lead.firstName, lead.lastName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#12213E]">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${leadStatusClass(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmail(lead.email);
                          setEmailModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 font-medium text-[#12213E] transition hover:text-[#C69259]"
                      >
                        <Mail className="h-3 w-3 text-[#C69259]" />
                        {lead.email}
                      </button>
                      <span className="capitalize">
                        {formatInterest(lead.interest)}
                      </span>
                      {lead.source ? (
                        <span className="capitalize text-[#9CA3AF]">
                          via {String(lead.source).replace(/_/g, " ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead._id, v)}
                  >
                    <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#E5EAF0] bg-white text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={lead.assignedConsultant?._id || "unassigned"}
                    onValueChange={(v) => assignConsultant(lead._id, v)}
                  >
                    <SelectTrigger className="h-9 w-[150px] rounded-xl border-[#E5EAF0] bg-white text-xs font-semibold">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {consultants.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAF0] bg-white text-[#12213E] transition hover:border-[#C69259]/40"
                        aria-label="Lead actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedLeadDetail(lead);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedEmail(lead.email);
                          setEmailModalOpen(true);
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Send email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openNotes(lead)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Notes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => convertLead(lead._id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Convert to
                        client
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteLead(lead._id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <LeadNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        lead={selectedLeadNotes}
        noteText={noteText}
        onNoteTextChange={setNoteText}
        editingNoteIndex={editingNoteIndex}
        pinnedNoteIndex={pinnedNoteIndex}
        onPin={setPinnedNoteIndex}
        onEdit={(idx, note) => {
          setEditingNoteIndex(idx);
          setNoteText(note);
        }}
        onDelete={handleDeleteNote}
        onSave={handleAddOrUpdateNote}
      />

      <LeadDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        lead={selectedLeadDetail}
      />

      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipient={selectedEmail}
        defaultSubject="Follow-up from First Step Wealth Group"
        defaultBody="Hello,\n\nWe are reaching out to you regarding your recent inquiry.\n\nBest regards,\nFirst Step Wealth Group Team"
      />
    </DashboardShell>
  );
}
