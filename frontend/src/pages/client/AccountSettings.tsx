import { useEffect, useState } from "react";
import { Settings, Loader2, Save, Volume2, BellRing } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  getAlertSoundPref,
  setAlertSoundPref,
  unlockAlertSound,
  playAlertSound,
} from "@/lib/alertSound";
import {
  disableDesktopAlerts,
  enableDesktopAlerts,
  fetchPushStatus,
  getPushPermission,
  pushSupported,
} from "@/lib/webPush";

export default function AccountSettings() {
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === "admin";
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState((user as any)?.phone || "");
  const [address, setAddress] = useState((user as any)?.address || "");
  const [saving, setSaving] = useState(false);
  const prefKey = `fswg:prefs:${user?._id || "guest"}`;
  const [prefs, setPrefs] = useState({
    emailDigest: true,
    smsReminders: false,
    consultReminders: true,
  });
  const [playSound, setPlaySound] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushState, setPushState] = useState<{
    configured: boolean;
    subscribed: boolean;
    permission: NotificationPermission | "unsupported";
  }>({
    configured: false,
    subscribed: false,
    permission: "unsupported",
  });

  useEffect(() => {
    setName(user?.name || "");
    setPhone((user as any)?.phone || "");
    setAddress((user as any)?.address || "");
    try {
      const raw = JSON.parse(localStorage.getItem(prefKey) || "null");
      if (raw) setPrefs(raw);
    } catch {
      /* ignore */
    }
    if (user?._id) {
      setPlaySound(getAlertSoundPref(String(user._id), user.role === "admin"));
    }
  }, [user, prefKey]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const permission = await getPushPermission();
      try {
        const status = await fetchPushStatus();
        if (!cancelled) {
          setPushState({
            configured: status.configured,
            subscribed: status.subscribed,
            permission,
          });
        }
      } catch {
        if (!cancelled) {
          setPushState((s) => ({ ...s, permission }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Name, phone, and address are required");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/users/profile", { name, phone, address });
      await refreshUser();
      localStorage.setItem(prefKey, JSON.stringify(prefs));
      if (user?._id && isAdmin) {
        setAlertSoundPref(String(user._id), playSound);
      }
      toast.success("Account updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not save profile");
      localStorage.setItem(prefKey, JSON.stringify(prefs));
      if (user?._id && isAdmin) {
        setAlertSoundPref(String(user._id), playSound);
      }
      toast.message("Notification preferences saved on this device");
    } finally {
      setSaving(false);
    }
  };

  const toggleSound = async (checked: boolean) => {
    setPlaySound(checked);
    if (user?._id) setAlertSoundPref(String(user._id), checked);
    if (checked) {
      const ok = await unlockAlertSound();
      if (ok) {
        await playAlertSound();
        toast.success("Alert sounds enabled");
      } else {
        toast.message("Click once more if the browser blocked audio");
      }
    }
  };

  const toggleDesktop = async () => {
    if (!isAdmin) return;
    setPushBusy(true);
    try {
      if (pushState.subscribed) {
        await disableDesktopAlerts();
        setPushState((s) => ({ ...s, subscribed: false }));
        toast.success("Desktop alerts disabled");
      } else {
        const result = await enableDesktopAlerts();
        if (result.ok) {
          setPushState((s) => ({
            ...s,
            subscribed: true,
            permission: "granted",
          }));
          toast.success(result.message);
        } else {
          toast.error(result.message);
          setPushState((s) => ({
            ...s,
            permission: Notification.permission as NotificationPermission,
          }));
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not update desktop alerts");
    } finally {
      setPushBusy(false);
    }
  };

  return (
    <ClientToolShell
      eyebrow="In-app · 10"
      title="Account & preferences"
      description="Update your profile and reminder preferences without leaving the client hub."
      icon={Settings}
    >
      <form onSubmit={saveProfile} className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4 border-b border-[#E5EAF0] pb-8">
          <h2 className="text-lg font-bold text-[#12213E]">Profile</h2>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#C69259]"
              required
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Email
            <input
              value={user?.email || ""}
              disabled
              className="mt-2 w-full rounded-2xl border border-[#EEF2F6] bg-[#EEF2F6] px-4 py-3 text-sm text-[#6B7280]"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Phone *
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#C69259]"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Address *
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm font-semibold outline-none focus:border-[#C69259]"
            />
          </label>
        </div>
        <div className="space-y-4 border-b border-[#E5EAF0] pb-8">
          <h2 className="text-lg font-bold text-[#12213E]">Reminders</h2>
          {(
            [
              ["emailDigest", "Weekly email digest"],
              ["smsReminders", "SMS appointment reminders"],
              ["consultReminders", "In-app consultation reminders"],
            ] as const
          ).map(([id, label]) => (
            <label
              key={id}
              className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/80 px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#12213E]">
                {label}
              </span>
              <input
                type="checkbox"
                checked={prefs[id]}
                onChange={(e) => setPrefs({ ...prefs, [id]: e.target.checked })}
                className="h-4 w-4 accent-[#12213E]"
              />
            </label>
          ))}

          {isAdmin && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#12213E]">
                Admin critical alerts
              </h3>
              <p className="text-xs text-[#6B7280]">
                Phase 1: sound + live updates while this tab is open. Phase 2:
                desktop push when the dashboard is closed.
              </p>
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                  <Volume2 className="h-4 w-4 text-[#C69259]" />
                  Play sound for alerts
                </span>
                <input
                  type="checkbox"
                  checked={playSound}
                  onChange={(e) => void toggleSound(e.target.checked)}
                  className="h-4 w-4 accent-[#12213E]"
                />
              </label>
              <div className="rounded-2xl bg-white/80 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#12213E]">
                      <BellRing className="h-4 w-4 text-[#C69259]" />
                      Desktop alerts
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {!pushSupported()
                        ? "Not supported in this browser."
                        : pushState.permission === "denied"
                          ? "Blocked in browser settings: re-enable notifications for this site, then try again."
                          : pushState.subscribed
                            ? "Enabled. You get OS alerts when the tab is closed."
                            : pushState.configured
                              ? "Enable once to receive OS notifications when away from the dashboard."
                              : "Server is missing VAPID keys: see backend/docs/ADMIN_ALERTS.md."}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={
                      pushBusy ||
                      !pushSupported() ||
                      !pushState.configured ||
                      pushState.permission === "denied"
                    }
                    onClick={() => void toggleDesktop()}
                    className="shrink-0 rounded-xl bg-[#12213E] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {pushBusy
                      ? "…"
                      : pushState.subscribed
                        ? "Disable"
                        : "Enable desktop alerts"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12213E] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </form>
    </ClientToolShell>
  );
}
