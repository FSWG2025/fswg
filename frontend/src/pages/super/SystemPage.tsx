import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import ConfirmPhraseModal from "@/features/super-admin/ConfirmPhraseModal";

type Settings = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  lockdown: boolean;
  readOnlyMode: boolean;
  freezeMessaging: boolean;
  freezeLeadIntake: boolean;
  freezePayments: boolean;
  botBlockEnabled: boolean;
  featureFlags: Record<string, boolean | { enabled: boolean }>;
  status: string;
};

function flagOn(v: boolean | { enabled: boolean } | undefined) {
  if (v === undefined) return true;
  return typeof v === "boolean" ? v : Boolean(v.enabled);
}

export default function SystemPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [confirm, setConfirm] = useState<"MAINTENANCE" | "LOCKDOWN" | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const load = () => {
    api
      .get("/super/settings")
      .then(({ data }) => {
        setSettings(data);
        setMessage(data.maintenanceMessage || "");
      })
      .catch(() => toast.error("Failed to load settings"));
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (body: Record<string, unknown>) => {
    const { data } = await api.patch("/super/settings", body);
    setSettings(data);
    toast.success("Settings updated");
  };

  if (!settings) {
    return <div className={SUPER.card}><p className={SUPER.body}>Loading system controls…</p></div>;
  }

  const flags = Object.keys(settings.featureFlags || {
    registration: true,
    leadCapture: true,
    rentalApplications: true,
    videoRooms: true,
    wealthStudio: true,
    whatsappCtas: true,
    pushNotifications: true,
    newsletter: true,
    promoBanners: true,
  });

  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>System control</p>
        <h2 className={SUPER.title}>Kill switches</h2>
        <p className={SUPER.body}>
          Status: <span className="text-[#C69259]">{settings.status}</span> ·
          confirmations required for catastrophic toggles.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Maintenance</p>
          <p className="mt-2 text-sm text-[#12213E]">
            {settings.maintenanceMode ? "ON: public APIs 503" : "Off"}
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-3 w-full rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
            rows={2}
          />
          <button
            type="button"
            className={`mt-3 ${settings.maintenanceMode ? SUPER.armedBtn : SUPER.armedBtn}`}
            onClick={() => {
              if (!settings.maintenanceMode) setConfirm("MAINTENANCE");
              else
                patch({
                  maintenanceMode: false,
                  reason: "Disabled maintenance",
                });
            }}
          >
            {settings.maintenanceMode ? "Disable maintenance" : "Enable maintenance"}
          </button>
        </div>

        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Lockdown</p>
          <p className="mt-2 text-sm text-[#12213E]">
            {settings.lockdown
              ? "ON: force-logout non-supers"
              : "Off"}
          </p>
          <button
            type="button"
            className={`mt-3 ${SUPER.armedBtn}`}
            onClick={() => {
              if (!settings.lockdown) setConfirm("LOCKDOWN");
              else patch({ lockdown: false, reason: "Ended lockdown" });
            }}
          >
            {settings.lockdown ? "End lockdown" : "Enable lockdown"}
          </button>
        </div>
      </div>

      <div className={`${SUPER.card} grid gap-3 sm:grid-cols-2`}>
        {(
          [
            ["readOnlyMode", "Freeze writes (read-only)"],
            ["freezeLeadIntake", "Freeze lead intake"],
            ["freezeMessaging", "Freeze messaging"],
            ["freezePayments", "Freeze payments / applications"],
            ["botBlockEnabled", "Bot block guard"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#E5EAF0] px-3 py-2.5 text-sm text-[#12213E]"
          >
            {label}
            <input
              type="checkbox"
              checked={Boolean((settings as any)[key])}
              onChange={(e) =>
                patch({ [key]: e.target.checked, reason: `Toggle ${key}` })
              }
            />
          </label>
        ))}
      </div>

      <div className={SUPER.card}>
        <p className={SUPER.eyebrow}>Feature flags</p>
        <h3 className={`mt-1 ${SUPER.title}`}>Product surfaces</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {flags.map((key) => {
            const on = flagOn(settings.featureFlags[key]);
            return (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#E5EAF0] px-3 py-2 text-sm text-[#12213E]"
              >
                <span className="font-mono text-xs">{key}</span>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) =>
                    patch({
                      featureFlags: { [key]: e.target.checked },
                      reason: `Flag ${key}=${e.target.checked}`,
                    })
                  }
                />
              </label>
            );
          })}
        </div>
      </div>

      <ConfirmPhraseModal
        open={confirm === "MAINTENANCE"}
        title="Enable maintenance mode"
        phrase="MAINTENANCE"
        description="Public site shows banner; APIs return 503 except health/login/super."
        onClose={() => setConfirm(null)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          await patch({
            maintenanceMode: true,
            maintenanceMessage: message,
            confirmPhrase,
            reason,
          });
        }}
      />
      <ConfirmPhraseModal
        open={confirm === "LOCKDOWN"}
        title="Enable platform lockdown"
        phrase="LOCKDOWN"
        description="Revokes all non-super sessions immediately."
        onClose={() => setConfirm(null)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          await patch({ lockdown: true, confirmPhrase, reason });
        }}
      />
    </div>
  );
}
