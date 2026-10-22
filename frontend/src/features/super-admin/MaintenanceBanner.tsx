import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type PublicSettings = {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  maintenanceEtaBlurb?: string;
  broadcastBanner?: string;
  status?: string;
};

export default function MaintenanceBanner() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/system/public")
      .then(({ data }) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {});
    const id = setInterval(() => {
      api
        .get("/system/public")
        .then(({ data }) => {
          if (!cancelled) setSettings(data);
        })
        .catch(() => {});
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!settings) return null;

  if (settings.maintenanceMode) {
    return (
      <div className="border-b border-[#E8D5BC] bg-[#FBF4EB] px-4 py-2.5 text-center text-sm text-[#12213E]">
        <strong className="text-[#C69259]">Maintenance</strong>
        {": "}
        {settings.maintenanceMessage ||
          "We're performing scheduled maintenance."}
        {settings.maintenanceEtaBlurb ? (
          <span className="text-[#6B7280]"> · {settings.maintenanceEtaBlurb}</span>
        ) : null}
      </div>
    );
  }

  if (settings.broadcastBanner) {
    return (
      <div className="border-b border-[#E5EAF0] bg-[#EEF2F6] px-4 py-2 text-center text-sm text-[#12213E]">
        {settings.broadcastBanner}
      </div>
    );
  }

  return null;
}
