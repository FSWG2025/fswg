import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  Eye,
} from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/types";
import CustomAlert from "@/components/global/CustomAlert";
import CustomPagination from "@/components/global/CustomPagination";
import EmailModal from "@/components/global/EmailModal";
import { useAuth } from "@/hooks/AuthProvider";
import {
  ROLE_LABELS,
  USER_ROLES,
  isPlatformAdmin,
  isSuperAdmin,
  type UserRole,
} from "@/lib/roles";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import { initials, roleBadgeClass } from "@/features/admin/users/roleBadge";
import UserFormDialog, {
  type UserFormValues,
} from "@/features/admin/users/UserFormDialog";
import ConfirmPhraseModal from "@/features/super-admin/ConfirmPhraseModal";

const roleEnum = z.enum(USER_ROLES as unknown as [UserRole, ...UserRole[]]);

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required").min(7, "Enter a valid phone"),
  address: z.string().min(1, "Address is required").min(2, "Enter your address"),
  clientType: z
    .enum(["lead", "consultation_client", "rental_applicant"])
    .optional()
    .or(z.literal("")),
  role: roleEnum,
  isActive: z.boolean(),
  expertise: z.string().optional(),
  // Edit default is "": must not fail min(6) when password is unchanged
  password: z
    .union([
      z.literal(""),
      z.string().min(6, "Password must be at least 6 characters"),
    ])
    .optional(),
});

interface Props {
  activeFilter?: "all" | "active" | "inactive";
}

const FILTERS = [
  { id: "all" as const, label: "All users", href: "/admin/clients" },
  { id: "active" as const, label: "Active", href: "/admin/clients/active" },
  { id: "inactive" as const, label: "Inactive", href: "/admin/clients/inactive" },
];

const ClientManagement = ({ activeFilter = "all" }: Props) => {
  const { user: currentUser, setUser } = useAuth();
  const [allClients, setAllClients] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<User | null>(null);
  const canImpersonate = isSuperAdmin(currentUser?.role);
  const editingSelf = Boolean(
    editingUser &&
      currentUser?._id &&
      String(editingUser._id) === String(currentUser._id),
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      clientType: undefined,
      role: "client",
      isActive: true,
      expertise: "",
      password: "",
    },
    mode: "onChange",
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      const { data } = await api.get(`/users?${params.toString()}`);
      setAllClients(data.users);
      setTotalPages(data.pagination.pages);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const displayedClients =
    activeFilter === "active"
      ? allClients.filter((c) => c.isActive)
      : activeFilter === "inactive"
        ? allClients.filter((c) => !c.isActive)
        : allClients;

  const stats = useMemo(() => {
    const active = allClients.filter((c) => c.isActive).length;
    const inactive = allClients.length - active;
    const clients = allClients.filter((c) => c.role === "client").length;
    return {
      active,
      inactive,
      clients,
      staff: allClients.length - clients,
      total: allClients.length,
    };
  }, [allClients]);

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      clientType: user.clientType,
      role: (user.role as UserRole) || "client",
      isActive: user.isActive,
      expertise: (user as any).expertise || "",
      password: "",
    });
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      clientType: undefined,
      role: "client",
      isActive: true,
      expertise: "",
      password: "",
    });
    setFormOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      const isAdmin = isPlatformAdmin(currentUser?.role);
      if (editingUser) {
        const payload: Record<string, unknown> = { ...values };
        if (!values.password) delete payload.password;
        if (!values.clientType) delete payload.clientType;

        // Never allow changing your own role / deactivating yourself from the directory
        if (
          currentUser?._id &&
          String(editingUser._id) === String(currentUser._id)
        ) {
          delete payload.role;
          delete payload.isActive;
          payload.role = editingUser.role;
          payload.isActive = editingUser.isActive;
        }

        // Critical user changes from non-admins → admin approval queue
        if (!isAdmin) {
          const requests: Promise<unknown>[] = [];
          if (values.role && values.role !== editingUser.role) {
            requests.push(
              api.post("/approvals", {
                type: "user_role_change",
                resourceType: "user",
                resourceId: editingUser._id,
                title: `Change role: ${editingUser.name}`,
                summary: `Change ${editingUser.name} from ${editingUser.role} to ${values.role}`,
                payload: { role: values.role },
              }),
            );
          }
          if (
            values.isActive === false &&
            editingUser.isActive &&
            editingUser.role !== "client"
          ) {
            requests.push(
              api.post("/approvals", {
                type: "user_deactivate",
                resourceType: "user",
                resourceId: editingUser._id,
                title: `Deactivate staff: ${editingUser.name}`,
                summary: `Deactivate ${editingUser.name} (${editingUser.role})`,
                payload: { isActive: false },
              }),
            );
          }
          if (requests.length) {
            await Promise.all(requests);
          }
          delete payload.role;
          delete payload.password;
          if (editingUser.role !== "client") delete payload.isActive;
        }

        await api.put(`/users/${editingUser._id}`, payload);
        toast.success(
          !isAdmin &&
            ((values.role && values.role !== editingUser.role) ||
              (values.isActive === false &&
                editingUser.isActive &&
                editingUser.role !== "client"))
            ? "Profile saved: critical changes queued for admin"
            : "User updated",
        );
      } else {
        await api.post("/users/register", {
          ...values,
          role: isAdmin ? values.role || "client" : "client",
        });
        toast.success("User created");
      }
      setFormOpen(false);
      setEditingUser(null);
      fetchClients();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const isAdmin = isPlatformAdmin(currentUser?.role);
    try {
      if (isAdmin) {
        await api.delete(`/users/${deleteTarget._id}`);
        toast.success("User deleted");
      } else {
        await api.post("/approvals", {
          type: "user_delete",
          resourceType: "user",
          resourceId: deleteTarget._id,
          title: `Delete user: ${deleteTarget.name}`,
          summary: `Delete ${deleteTarget.name} (${deleteTarget.email}, ${deleteTarget.role})`,
          payload: {},
        });
        toast.success("Delete request sent for admin approval");
      }
      fetchClients();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed");
      throw e;
    } finally {
      setDeleteTarget(null);
    }
  };

  const subtitle =
    activeFilter === "active"
      ? "Active users"
      : activeFilter === "inactive"
        ? "Inactive users"
        : "All users";

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={DASH.panelHero}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={DASH.eyebrowMuted}>Directory</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
              Users
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {subtitle}: create accounts, assign roles, and manage access.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search users…"
                className="w-full rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#C69259] focus:ring-2 focus:ring-[#C69259]/15"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className={`${DASH.primaryBtn} shrink-0 whitespace-nowrap`}
            >
              <Plus className="h-4 w-4 shrink-0" />
              Add user
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              to={f.href}
              className={
                activeFilter === f.id
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
              value={stats.total}
              sub="Loaded in current page"
              icon={Users}
            />
            <SnapshotCard
              index={1}
              label="Active"
              value={stats.active}
              sub="Can sign in"
              icon={UserCheck}
            />
            <SnapshotCard
              index={2}
              label="Inactive"
              value={stats.inactive}
              sub="Access paused"
              icon={UserX}
            />
            <SnapshotCard
              index={3}
              label="Clients"
              value={stats.clients}
              sub={`${stats.staff} staff / partners`}
              icon={Users}
            />
          </SnapshotRail>
        </div>
      </motion.div>

      <div className={DASH.panel}>
        <div className="mb-4">
          <p className={DASH.eyebrow}>Directory · {subtitle}</p>
          <h2 className={`mt-1 ${DASH.title}`}>
            {displayedClients.length}{" "}
            {displayedClients.length === 1 ? "person" : "people"}
          </h2>
        </div>

        {loading && displayedClients.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#6B7280]">Loading users…</p>
        ) : displayedClients.length === 0 ? (
          <div className="rounded-2xl bg-[#F7FBFE] py-14 text-center">
            <Users className="mx-auto h-8 w-8 text-[#C69259]/50" />
            <p className="mt-3 text-sm font-semibold text-[#12213E]">No users found</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Try another filter or create a new account.
            </p>
            <button type="button" onClick={handleCreate} className={`mt-5 ${DASH.primaryBtn}`}>
              <Plus className="h-4 w-4" /> Add user
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayedClients.map((c, i) => (
              <motion.li
                key={c._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
                className="rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-4 transition hover:border-[#C69259]/35 hover:bg-white sm:p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-sm font-bold text-white shadow-sm">
                    {initials(c.name || "?")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold leading-snug text-[#12213E] sm:truncate">
                      {c.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${roleBadgeClass(
                          c.role || "client",
                        )}`}
                      >
                        {ROLE_LABELS[(c.role as UserRole) || "client"] || c.role}
                      </span>
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5C8] px-2 py-0.5 text-[10px] font-bold text-[#3F6212]">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F1] px-2 py-0.5 text-[10px] font-bold text-[#9F1239]">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Desktop actions stay beside the header */}
                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    {canImpersonate &&
                      c.role !== "super_admin" &&
                      String(c._id) !== String(currentUser?._id) && (
                        <button
                          type="button"
                          onClick={() => setImpersonateTarget(c)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#C69259]/40 bg-[#FBF4EB] px-3 text-xs font-semibold text-[#9A6B35] transition hover:bg-[#F4E6D4]"
                          title="Open their dashboard as them"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View as
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-3 text-xs font-semibold text-[#12213E] transition hover:border-[#C69259]/40"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(c);
                        setDeleteOpen(true);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#FECACA] bg-white text-red-500 transition hover:bg-red-50"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-[#E8ECF1]/80 pt-3 sm:ml-14 sm:border-0 sm:pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmail(c.email);
                      setEmailModalOpen(true);
                    }}
                    className="flex w-full min-w-0 items-center gap-2 text-left text-xs font-medium text-[#12213E] transition hover:text-[#C69259] sm:inline-flex sm:w-auto"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#C69259]" />
                    <span className="truncate">{c.email}</span>
                  </button>
                  {c.phone ? (
                    <p className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{c.phone}</span>
                    </p>
                  ) : null}
                </div>

                {/* Mobile full-width action row */}
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:hidden">
                  <div className="grid grid-cols-2 gap-2">
                    {canImpersonate &&
                      c.role !== "super_admin" &&
                      String(c._id) !== String(currentUser?._id) && (
                        <button
                          type="button"
                          onClick={() => setImpersonateTarget(c)}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#C69259]/40 bg-[#FBF4EB] text-xs font-semibold text-[#9A6B35]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View as
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white text-xs font-semibold text-[#12213E]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(c);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-white text-red-500"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={!!editingUser}
        form={form}
        currentUserRole={currentUser?.role}
        lockOwnRole={editingSelf}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={onSubmit}
      />

      <ConfirmPhraseModal
        open={!!impersonateTarget}
        title={`View dashboard as ${impersonateTarget?.email}?`}
        phrase="IMPERSONATE"
        description="You will see their exact dashboard, data, and actions for up to 30 minutes. Everything is audited. Exit anytime from the banner."
        onClose={() => setImpersonateTarget(null)}
        onConfirm={async ({ reason }) => {
          if (!impersonateTarget) return;
          const { data } = await api.post(
            `/super/impersonate/${impersonateTarget._id}`,
            { reason },
          );
          if (data.token) localStorage.setItem("fswg_token", data.token);
          if (data.user) setUser(data.user);
          else if (data.grant?.target) setUser(data.grant.target);
          toast.success(`Now viewing as ${impersonateTarget.name}`);
          window.location.href = "/dashboard";
        }}
      />

      <CustomAlert
        isOpen={deleteOpen}
        setIsOpen={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        handleDelete={handleDelete}
        title={
          isPlatformAdmin(currentUser?.role)
            ? "Delete this user?"
            : "Request user deletion?"
        }
        description={
          isPlatformAdmin(currentUser?.role)
            ? "Their account access ends immediately. Profile data and login credentials will be removed from the platform."
            : "Admins must sign off before this account is removed. You'll be notified when they decide."
        }
        entityLabel={
          deleteTarget
            ? `${deleteTarget.name} · ${deleteTarget.email}`
            : undefined
        }
        confirmLabel={
          isPlatformAdmin(currentUser?.role)
            ? "Delete permanently"
            : "Send for approval"
        }
        cancelLabel="Go back"
        tone={isPlatformAdmin(currentUser?.role) ? "danger" : "warning"}
      />
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipient={selectedEmail}
        defaultSubject="Communication from First Step Wealth Group"
        defaultBody={`Dear Client,\n\nWe are reaching out to you regarding your account.\n\nBest regards,\nFirst Step Wealth Group Team`}
      />
    </DashboardShell>
  );
};

export default ClientManagement;
