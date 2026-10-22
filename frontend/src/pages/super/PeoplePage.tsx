import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  MoreHorizontal,
  ShieldAlert,
  UserCheck,
  UserX,
  LogOut,
  Eye,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import ConfirmPhraseModal from "@/features/super-admin/ConfirmPhraseModal";
import { useAuth } from "@/hooks/AuthProvider";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

type Person = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  riskFlags?: string[];
  lastLoginAt?: string;
  lastActionAt?: string;
};

function ActionsMenu({
  user,
  isSelf,
  onSuspend,
  onRestore,
  onForceLogout,
  onImpersonate,
  onPlaybook,
}: {
  user: Person;
  isSelf?: boolean;
  onSuspend: () => void;
  onRestore: () => void;
  onForceLogout: () => void;
  onImpersonate: () => void;
  onPlaybook: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const item = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    tone: "default" | "danger" = "default",
  ) => (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
        tone === "danger"
          ? "text-red-700 hover:bg-red-50"
          : "text-[#12213E] hover:bg-[#F7FBFE]",
      )}
      onClick={() => {
        setOpen(false);
        onClick();
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAF0] bg-white text-[#12213E] transition hover:border-[#C69259]/50 hover:bg-[#FBF4EB]"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Actions for {user.name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-52 rounded-xl border border-[#E5EAF0] bg-white p-1 shadow-[0_8px_24px_rgba(18,33,62,0.12)]"
        >
          {isSelf ? (
            <p className="px-3 py-2 text-xs text-[#9CA3AF]">
              This is you. Self suspend / force logout / playbook are blocked.
            </p>
          ) : (
            <>
              {user.isActive
                ? item(
                    "Suspend",
                    <UserX className="h-4 w-4 text-[#C69259]" />,
                    onSuspend,
                    "danger",
                  )
                : item(
                    "Restore",
                    <UserCheck className="h-4 w-4 text-emerald-600" />,
                    onRestore,
                  )}
              {item(
                "Force logout",
                <LogOut className="h-4 w-4 text-[#6B7280]" />,
                onForceLogout,
              )}
              {user.role !== "super_admin" &&
                item(
                  "Login as…",
                  <Fingerprint className="h-4 w-4 text-[#6B7280]" />,
                  onImpersonate,
                )}
              {user.role !== "super_admin" &&
                item(
                  "Compromised playbook",
                  <ShieldAlert className="h-4 w-4 text-red-600" />,
                  onPlaybook,
                  "danger",
                )}
            </>
          )}
          <Link
            to={`/dashboard/super/forensics/user/${user._id}`}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#12213E] hover:bg-[#F7FBFE]"
            onClick={() => setOpen(false)}
          >
            <Eye className="h-4 w-4 text-[#6B7280]" />
            Open forensics
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const { user: me, setUser } = useAuth();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [users, setUsers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<{
    type: "suspend" | "impersonate" | "playbook";
    user: Person;
  } | null>(null);

  const isSelf = (u: Person) =>
    Boolean(me?._id && String(me._id) === String(u._id));

  const load = () => {
    setLoading(true);
    api
      .get("/super/people", { params: { search: q || undefined, limit: 50 } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error("Failed to load people"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className={SUPER.eyebrow}>People control</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#12213E]">
          Accounts
        </h2>
        <p className={`${SUPER.body} mt-1 max-w-2xl`}>
          Suspend, force logout, and impersonate from the row menu. Every action
          is audited.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name, email, phone"
          className={`${SUPER.input} sm:flex-1`}
        />
        <button type="button" onClick={load} className={`${SUPER.primaryBtn} shrink-0`}>
          Search
        </button>
      </div>

      <div className={SUPER.card}>
        {loading ? (
          <p className={SUPER.body}>Loading…</p>
        ) : users.length === 0 ? (
          <p className={SUPER.body}>No accounts match.</p>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <ul className="space-y-3 md:hidden">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#12213E]">{u.name}</p>
                      <p className="truncate text-xs text-[#6B7280]">{u.email}</p>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        {roleLabel(u.role)} ·{" "}
                        <span className={u.isActive ? "text-emerald-600" : "text-red-600"}>
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                      </p>
                    </div>
                    <ActionsMenu
                      user={u}
                      isSelf={isSelf(u)}
                      onSuspend={() => setConfirm({ type: "suspend", user: u })}
                      onRestore={async () => {
                        await api.post(`/super/users/${u._id}/restore`);
                        toast.success("Restored");
                        load();
                      }}
                      onForceLogout={async () => {
                        await api.post(`/super/users/${u._id}/force-logout`);
                        toast.success("Sessions revoked");
                      }}
                      onImpersonate={() =>
                        setConfirm({ type: "impersonate", user: u })
                      }
                      onPlaybook={() => setConfirm({ type: "playbook", user: u })}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop: clean table + overflow menu */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">
                  <tr>
                    <th className="pb-3 pr-3 font-semibold">Person</th>
                    <th className="pb-3 pr-3 font-semibold">Role</th>
                    <th className="pb-3 pr-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-[#E5EAF0]">
                      <td className="py-3.5 pr-3">
                        <p className="font-semibold text-[#12213E]">{u.name}</p>
                        <p className="text-xs text-[#6B7280]">{u.email}</p>
                      </td>
                      <td className="py-3.5 pr-3 text-[#4B5563]">
                        {roleLabel(u.role)}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700",
                          )}
                        >
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                        {u.riskFlags?.length ? (
                          <p className="mt-1 text-[10px] font-medium text-[#C69259]">
                            {u.riskFlags.join(", ")}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex justify-end">
                          <ActionsMenu
                            user={u}
                            isSelf={isSelf(u)}
                            onSuspend={() =>
                              setConfirm({ type: "suspend", user: u })
                            }
                            onRestore={async () => {
                              await api.post(`/super/users/${u._id}/restore`);
                              toast.success("Restored");
                              load();
                            }}
                            onForceLogout={async () => {
                              await api.post(`/super/users/${u._id}/force-logout`);
                              toast.success("Sessions revoked");
                            }}
                            onImpersonate={() =>
                              setConfirm({ type: "impersonate", user: u })
                            }
                            onPlaybook={() =>
                              setConfirm({ type: "playbook", user: u })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmPhraseModal
        open={confirm?.type === "suspend"}
        title={`Suspend ${confirm?.user.email}?`}
        phrase="SUSPEND"
        description="Blocks login and API access. Sessions are revoked."
        onClose={() => setConfirm(null)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          await api.post(`/super/users/${confirm!.user._id}/suspend`, {
            confirmPhrase,
            reason,
          });
          toast.success("User suspended");
          load();
        }}
      />

      <ConfirmPhraseModal
        open={confirm?.type === "impersonate"}
        title={`Impersonate ${confirm?.user.email}?`}
        phrase="IMPERSONATE"
        description="30-minute sandboxed session. All actions logged with both IDs."
        onClose={() => setConfirm(null)}
        onConfirm={async ({ reason }) => {
          const { data } = await api.post(
            `/super/impersonate/${confirm!.user._id}`,
            { reason },
          );
          if (data.token) localStorage.setItem("fswg_token", data.token);
          if (data.user) setUser(data.user);
          else if (data.grant?.target) setUser(data.grant.target);
          toast.success(
            `Now viewing as ${confirm!.user.name} — their full dashboard`,
          );
          window.location.href = "/dashboard";
        }}
      />

      <ConfirmPhraseModal
        open={confirm?.type === "playbook"}
        title="Compromised account playbook"
        phrase="COMPROMISED"
        description="Suspend, force logout, invalidate resets, and set legal hold."
        onClose={() => setConfirm(null)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          await api.post(
            `/super/users/${confirm!.user._id}/compromised-playbook`,
            { confirmPhrase, reason },
          );
          toast.success("Playbook applied");
          load();
        }}
      />
    </div>
  );
}
