import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Crosshair,
  Eye,
  Flag,
  LayoutDashboard,
  LogOut,
  Map,
  Radio,
  Search,
  ShieldAlert,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { SUPER, statusLed, type SystemStatus } from "./superTokens";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LogoutModal from "@/components/global/LogoutModal";

const NAV = [
  { to: "/dashboard/super", end: true, label: "Pulse", icon: Radio },
  {
    to: "/dashboard?view=admin",
    end: false,
    label: "Admin overview",
    icon: LayoutDashboard,
  },
  { to: "/dashboard/super/omniscience", label: "Omniscience", icon: Eye },
  { to: "/dashboard/super/people", label: "People", icon: Users },
  { to: "/dashboard/super/visitors", label: "Visitors", icon: Map },
  { to: "/dashboard/super/system", label: "Kill Switches", icon: Zap },
  { to: "/dashboard/super/security", label: "Security", icon: ShieldAlert },
  { to: "/dashboard/super/war-room", label: "War Room", icon: Crosshair },
  { to: "/dashboard/super/content", label: "Ads / Surfaces", icon: Flag },
  { to: "/dashboard/super/exports", label: "Exports", icon: Activity },
];

export default function SuperLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<SystemStatus>("OK");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      api
        .get("/super/pulse")
        .then(({ data }) => {
          if (!cancelled && data.status) setStatus(data.status);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setMobileNav(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMobileNav(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo(
    () => [
      ...NAV.map((n) => ({
        label: `Go to ${n.label}`,
        run: () => navigate(n.to),
      })),
      {
        label: "Search people by email…",
        run: () =>
          navigate(`/dashboard/super/people?q=${encodeURIComponent(q)}`),
      },
    ],
    [navigate, q],
  );

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(q.toLowerCase()),
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  const SideNav = (
    <>
      <div className="mb-6 flex items-center gap-2.5 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#12213E] text-sm font-bold text-[#C69259]">
          FS
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#12213E]">First Step</p>
          <p className="text-[11px] font-medium text-[#94A3B8]">Command Center</p>
        </div>
      </div>

      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
        Operations
      </p>
      <ul className="space-y-1">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => {
                const adminOverviewActive =
                  item.to.includes("view=admin") &&
                  location.pathname === "/dashboard" &&
                  new URLSearchParams(location.search).get("view") === "admin";
                const active = adminOverviewActive || (isActive && !item.to.includes("view=admin"));
                return cn(active ? SUPER.navActive : SUPER.navIdle);
              }}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-70" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto space-y-3 pt-6">
        <div className={SUPER.accentGrad}>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C69259]">
            Super
          </span>
          <p className="mt-2 text-sm font-semibold leading-snug">
            Platform status: {status}
          </p>
          <p className="mt-1 text-[11px] text-white/70">
            Every kill switch is confirmed and audited.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/super/system")}
            className="mt-3 w-full rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            Open kill switches
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className={cn(SUPER.navIdle, "w-full")}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      toast.error("Logout failed");
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  return (
    <div className={SUPER.page}>
      <div className={SUPER.shell}>
        {/* Desktop side rail */}
        <aside className={cn(SUPER.side, "hidden lg:flex")}>{SideNav}</aside>

        {/* Mobile drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#12213E]/35"
              aria-label="Close menu"
              onClick={() => setMobileNav(false)}
            />
            <aside className={cn(SUPER.side, "relative z-10 h-full shadow-xl")}>
              {SideNav}
            </aside>
          </div>
        )}

        <div className={SUPER.main}>
          <header className={SUPER.topBar}>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-[#E8ECF1] lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <Radio className="h-4 w-4" />
            </button>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setPaletteOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPaletteOpen(true);
                  }
                }}
                placeholder="Search people, visitors, forensics…"
                className={cn(SUPER.input, "pl-10")}
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/super/people")}
              className={cn(SUPER.softBtn, "hidden sm:inline-flex")}
            >
              People
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/super/war-room")}
              className={SUPER.primaryBtn}
            >
              War Room
            </button>

            <span className={cn(SUPER.statusPill, "hidden md:inline-flex")}>
              <span className={statusLed(status)} aria-hidden />
              {status}
            </span>

            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-[#E8ECF1] sm:inline-flex"
              onClick={() => navigate("/dashboard/super/security")}
              aria-label="Security desk"
            >
              <Bell className="h-4 w-4 text-[#12213E]" />
            </button>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12213E] text-xs font-bold text-[#C69259]"
              title={user?.email}
            >
              {initials}
            </div>
          </header>

          <div className={SUPER.content}>
            <Outlet context={{ systemStatus: status }} />
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => {
          if (!loggingOut) setLogoutOpen(false);
        }}
        onConfirm={confirmLogout}
      />

      {paletteOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-[#12213E]/30 p-4 pt-[14vh] backdrop-blur-[2px]"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className={cn(SUPER.card, "w-full max-w-lg")}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Jump anywhere in Command Center…"
              className={SUPER.input}
            />
            <ul className="mt-3 max-h-72 overflow-auto">
              {filtered.map((c) => (
                <li key={c.label}>
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#12213E] hover:bg-[#F4F6F8]"
                    onClick={() => {
                      c.run();
                      setPaletteOpen(false);
                    }}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-center text-[11px] text-[#94A3B8]">
              Press Esc to close · ⌘K anytime
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
