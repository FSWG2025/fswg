import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import ConfirmPhraseModal from "@/features/super-admin/ConfirmPhraseModal";
import { toast } from "sonner";
import { formatExactDateTime } from "@/features/admin/activity/activityMeta";

export default function WarRoomPage() {
  const [pulse, setPulse] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [tab, setTab] = useState<"firehose" | "map" | "flags">("firehose");
  const [confirmMaint, setConfirmMaint] = useState(false);

  const refresh = () => {
    if (document.visibilityState === "hidden") return;
    Promise.all([
      api.get("/super/pulse"),
      api.get("/super/activity/stream", { params: { limit: 40 } }),
      api.get("/super/settings"),
    ])
      .then(([p, a, s]) => {
        setPulse(p.data);
        setEvents(a.data.events || []);
        setSettings(s.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8_000);
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (e.key === "m") setConfirmMaint(true);
      if (e.key === "f" && settings) {
        api
          .patch("/super/settings", {
            freezeLeadIntake: !settings.freezeLeadIntake,
            reason: "War room shortcut f",
          })
          .then(({ data }) => {
            setSettings(data);
            toast.message(
              data.freezeLeadIntake ? "Lead intake frozen" : "Lead intake open",
            );
          });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.freezeLeadIntake]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={SUPER.eyebrow}>War room</p>
          <h2 className={SUPER.title}>Live ops · compact</h2>
        </div>
        <p className="text-[11px] text-[#9CA3AF]">
          Shortcuts: <kbd className="rounded border border-[#E5EAF0] px-1">f</kbd>{" "}
          freeze intake ·{" "}
          <kbd className="rounded border border-[#E5EAF0] px-1">m</kbd> maintenance
        </p>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 lg:hidden">
        {(
          [
            ["firehose", "Firehose"],
            ["map", "Pulse"],
            ["flags", "Flags"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={tab === id ? SUPER.primaryBtn : SUPER.armedBtn}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-12 lg:grid-rows-[1fr_auto]">
        <section
          className={`${SUPER.card} max-h-[55vh] overflow-auto lg:col-span-4 ${tab !== "firehose" ? "hidden lg:block" : ""}`}
        >
          <p className={SUPER.eyebrow}>Firehose</p>
          <ul className="mt-2 space-y-1.5 text-xs">
            {events.map((ev) => (
              <li key={ev.id} className="border-b border-[#E5EAF0]/50 py-1.5">
                <p className="text-[#12213E]">{ev.action}</p>
                <p className="text-[10px] text-[#9CA3AF]">
                  {ev.actor?.name || "system"}
                  {ev.details ? ` · ${ev.details}` : ""}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">
                  {ev.at ? formatExactDateTime(ev.at) : ""}
                  {ev.locationLabel
                    ? ` · ${ev.locationLabel}`
                    : ev.ip
                      ? ` · IP ${ev.ip}`
                      : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          className={`${SUPER.card} lg:col-span-5 ${tab !== "map" ? "hidden lg:block" : ""}`}
        >
          <p className={SUPER.eyebrow}>Center · pulse</p>
          {pulse ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-[#F7FBFE] p-3">
                <p className="text-[#9CA3AF]">Visitors 5m</p>
                <p className="text-2xl font-bold text-[#12213E]">
                  {pulse.traffic?.liveVisitors5m}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7FBFE] p-3">
                <p className="text-[#9CA3AF]">Leads / hr</p>
                <p className="text-2xl font-bold text-[#12213E]">
                  {pulse.leads?.lastHour}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7FBFE] p-3">
                <p className="text-[#9CA3AF]">Failed 60m</p>
                <p className="text-2xl font-bold text-[#12213E]">
                  {pulse.security?.failedSignals60m}
                </p>
              </div>
              <div className="rounded-lg bg-[#F7FBFE] p-3">
                <p className="text-[#9CA3AF]">Approvals</p>
                <p className="text-2xl font-bold text-[#12213E]">
                  {pulse.queues?.approvalsPending}
                </p>
              </div>
            </div>
          ) : (
            <p className={SUPER.body}>Loading…</p>
          )}
          <Link to="/dashboard/super/visitors" className={`mt-3 inline-block ${SUPER.ghostLink}`}>
            Open visitor map →
          </Link>
        </section>

        <section
          className={`${SUPER.card} lg:col-span-3 ${tab !== "flags" ? "hidden lg:block" : ""}`}
        >
          <p className={SUPER.eyebrow}>Flags</p>
          {settings ? (
            <ul className="mt-2 space-y-2 text-xs text-[#6B7280]">
              <li>Maintenance: {String(settings.maintenanceMode)}</li>
              <li>Lockdown: {String(settings.lockdown)}</li>
              <li>Read-only: {String(settings.readOnlyMode)}</li>
              <li>Freeze leads: {String(settings.freezeLeadIntake)}</li>
              <li>Bot guard: {String(settings.botBlockEnabled)}</li>
            </ul>
          ) : null}
          <Link to="/dashboard/super/system" className={`mt-3 inline-block ${SUPER.ghostLink}`}>
            Full kill switches →
          </Link>
        </section>

        <section className={`${SUPER.card} lg:col-span-12`}>
          <p className={SUPER.eyebrow}>Bottom · staff + errors</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {(pulse?.staffHeartbeat || []).slice(0, 12).map((s: any) => (
              <span
                key={s.id}
                className={
                  s.idle ? "text-amber-400" : "text-emerald-400"
                }
              >
                {s.name}
              </span>
            ))}
            <span className="text-red-400">
              errors 60m: {pulse?.security?.errorSignals60m ?? "-"}
            </span>
          </div>
        </section>
      </div>

      <ConfirmPhraseModal
        open={confirmMaint}
        title="Enable maintenance from War Room"
        phrase="MAINTENANCE"
        onClose={() => setConfirmMaint(false)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          const { data } = await api.patch("/super/settings", {
            maintenanceMode: true,
            confirmPhrase,
            reason,
          });
          setSettings(data);
          toast.success("Maintenance enabled");
        }}
      />
    </div>
  );
}
