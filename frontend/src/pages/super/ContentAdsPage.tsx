import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import ConfirmPhraseModal from "@/features/super-admin/ConfirmPhraseModal";

export default function ContentAdsPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [form, setForm] = useState({
    key: "",
    title: "",
    body: "",
    ctaLabel: "",
    ctaHref: "",
  });
  const [killAll, setKillAll] = useState(false);

  const load = () => {
    api
      .get("/super/promos")
      .then(({ data }) => setPromos(data.promos || []))
      .catch(() => toast.error("Failed to load promos"));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>Owned surfaces</p>
        <h2 className={SUPER.title}>Ads / promo control</h2>
        <p className={SUPER.body}>
          CMS-lite banners without a deploy. Kill promo panic is one click.
        </p>
      </div>

      <form
        className={`${SUPER.card} grid gap-2 sm:grid-cols-2`}
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post("/super/promos", form);
          toast.success("Promo saved");
          setForm({ key: "", title: "", body: "", ctaLabel: "", ctaHref: "" });
          load();
        }}
      >
        <input
          required
          placeholder="key (hero-spring)"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
        />
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
        />
        <textarea
          required
          placeholder="Body"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="sm:col-span-2 rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
          rows={2}
        />
        <input
          placeholder="CTA label"
          value={form.ctaLabel}
          onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
          className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
        />
        <input
          placeholder="CTA href"
          value={form.ctaHref}
          onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
          className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
        />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className={SUPER.primaryBtn}>
            Save promo
          </button>
          <button
            type="button"
            className={SUPER.armedBtn}
            onClick={() => setKillAll(true)}
          >
            Kill all promos
          </button>
        </div>
      </form>

      <div className={SUPER.card}>
        <ul className="space-y-2">
          {promos.length === 0 ? (
            <li className={SUPER.body}>No promos configured.</li>
          ) : (
            promos.map((p) => (
              <li
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5EAF0] px-3 py-2"
              >
                <div>
                  <p className="font-mono text-xs text-[#C69259]">{p.key}</p>
                  <p className="text-sm text-[#12213E]">{p.title}</p>
                  <p className="text-xs text-[#6B7280]">{p.body}</p>
                  <p className="text-[10px] text-[#9CA3AF]">
                    {p.killed ? "KILLED" : p.active ? "active" : "inactive"}
                  </p>
                </div>
                {!p.killed && (
                  <button
                    type="button"
                    className={SUPER.dangerBtn}
                    onClick={async () => {
                      await api.post(`/super/promos/${p._id}/kill`);
                      load();
                    }}
                  >
                    Kill
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <ConfirmPhraseModal
        open={killAll}
        title="Kill all promos"
        phrase="KILL_PROMO"
        onClose={() => setKillAll(false)}
        onConfirm={async ({ confirmPhrase, reason }) => {
          await api.post("/super/promos/kill-all", { confirmPhrase, reason });
          toast.success("All promos killed");
          load();
        }}
      />
    </div>
  );
}
