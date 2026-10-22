import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";

export default function SecurityPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [watch, setWatch] = useState<any[]>([]);
  const [pulse, setPulse] = useState<any>(null);
  const [form, setForm] = useState({ kind: "ip", value: "", label: "" });

  const load = () => {
    Promise.all([
      api.get("/super/bots"),
      api.get("/super/watchlist"),
      api.get("/super/pulse"),
    ])
      .then(([b, w, p]) => {
        setBots(b.data.blocks || []);
        setWatch(w.data.items || []);
        setPulse(p.data);
      })
      .catch(() => toast.error("Security desk failed to load"));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>Threat desk</p>
        <h2 className={SUPER.title}>Security & bots</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Failed · 60m</p>
          <p className="mt-2 text-3xl font-bold text-[#12213E]">
            {pulse?.security?.failedSignals60m ?? "-"}
          </p>
        </div>
        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Bots today</p>
          <p className="mt-2 text-3xl font-bold text-[#12213E]">
            {pulse?.security?.botsBlockedToday ?? "-"}
          </p>
        </div>
        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Deploy</p>
          <p className="mt-2 text-sm text-[#6B7280]">
            Node / SHA via /api/super/health
          </p>
        </div>
      </div>

      <div className={SUPER.card}>
        <p className={SUPER.eyebrow}>Watchlist</p>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await api.post("/super/watchlist", form);
            toast.success("Watch added");
            setForm({ kind: "ip", value: "", label: "" });
            load();
          }}
        >
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
            className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-2 py-2 text-sm text-[#12213E]"
          >
            <option value="ip">IP</option>
            <option value="email">Email</option>
            <option value="visitorId">Visitor ID</option>
            <option value="userId">User ID</option>
          </select>
          <input
            required
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder="Value"
            className="min-w-[160px] flex-1 rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
          />
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label"
            className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
          />
          <button type="submit" className={SUPER.primaryBtn}>
            Watch
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {watch.length === 0 ? (
            <li className={SUPER.body}>No watch entries.</li>
          ) : (
            watch.map((w) => (
              <li
                key={w._id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[#E5EAF0] px-3 py-2"
              >
                <span className="text-[#12213E]">
                  <span className="text-[#C69259]">{w.kind}</span> {w.value}
                  {w.hitCount ? (
                    <span className="ml-2 text-[11px] text-amber-400">
                      hits {w.hitCount}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-300"
                  onClick={async () => {
                    await api.delete(`/super/watchlist/${w._id}`);
                    load();
                  }}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className={SUPER.card}>
        <p className={SUPER.eyebrow}>Bot blocks</p>
        <ul className="mt-3 max-h-80 space-y-2 overflow-auto text-sm">
          {bots.length === 0 ? (
            <li className={SUPER.body}>No blocks recorded.</li>
          ) : (
            bots.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[#E5EAF0] px-3 py-2"
              >
                <div>
                  <p className="text-[#12213E]">{b.ip || b.visitorId}</p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    score {b.score} · {b.reason}
                  </p>
                </div>
                <button
                  type="button"
                  className={SUPER.armedBtn}
                  onClick={async () => {
                    await api.delete(`/super/bots/${b._id}`);
                    toast.success("Unblocked");
                    load();
                  }}
                >
                  Unblock
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
