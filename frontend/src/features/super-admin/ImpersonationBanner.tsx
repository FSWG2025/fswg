import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { SUPER } from "./superTokens";

type ImpStatus = {
  active: boolean;
  target?: { name?: string; email?: string; role?: string };
  impersonator?: { name?: string; email?: string; role?: string };
};

export default function ImpersonationBanner() {
  const { setUser, refreshUser } = useAuth();
  const [status, setStatus] = useState<ImpStatus>({ active: false });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/users/profile");
        if (cancelled) return;
        if (data.impersonation?.active) {
          setStatus({
            active: true,
            target: data.impersonation.actingAs,
            impersonator: data.impersonation.impersonator,
          });
        } else {
          setStatus({ active: false });
        }
      } catch {
        if (!cancelled) setStatus({ active: false });
      }
    };
    load();
    const id = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!status.active) return null;

  const exit = async () => {
    try {
      const { data } = await api.delete("/super/impersonate");
      if (data.token) localStorage.setItem("fswg_token", data.token);
      if (data.user) setUser(data.user);
      else await refreshUser();
      setStatus({ active: false });
      toast.success("Exited impersonation");
      window.location.href = "/dashboard/super/people";
    } catch {
      toast.error("Could not exit impersonation");
    }
  };

  return (
    <div className="sticky top-0 z-[60] border-b border-[#C69259]/40 bg-[#12213E] px-4 py-2.5 text-white">
      <div className="mx-auto flex w-[98%] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className={SUPER.badge}>Viewing as</span>
          <span className="font-semibold">
            {status.target?.name || status.target?.email}
          </span>
          <span className="text-[#94A3B8]">
            ({status.target?.role}). Exit returns to{" "}
            {status.impersonator?.email}
          </span>
        </div>
        <button type="button" onClick={exit} className={SUPER.dangerBtn}>
          Exit impersonation
        </button>
      </div>
    </div>
  );
}
