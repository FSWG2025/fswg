import { toast } from "sonner";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";

export default function ExportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>Legal / compliance</p>
        <h2 className={SUPER.title}>Exports & holds</h2>
        <p className={SUPER.body}>
          Audit history is never silently deleted. Soft-delete is blocked when
          legal_hold is set on an account.
        </p>
      </div>

      <div className={`${SUPER.card} space-y-3`}>
        <button
          type="button"
          className={SUPER.primaryBtn}
          onClick={async () => {
            const res = await api.get("/super/activity/export", {
              params: { format: "csv" },
              responseType: "blob",
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = "omniscience-export.csv";
            a.click();
            toast.success("Export started");
          }}
        >
          Export omniscience CSV
        </button>
        <button
          type="button"
          className={SUPER.armedBtn}
          onClick={async () => {
            const res = await api.get("/super/activity/export", {
              params: { format: "json" },
            });
            const blob = new Blob([JSON.stringify(res.data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "omniscience-export.json";
            a.click();
          }}
        >
          Export omniscience JSON
        </button>
        <p className={`text-xs ${SUPER.body}`}>
          For a data-subject pack, open People → Forensics on the user, then
          export related entities from there. Mark legal_hold via People flags
          API / compromised playbook.
        </p>
      </div>
    </div>
  );
}
