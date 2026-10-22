import { useEffect, useState } from "react";
import { Shield, CheckCircle2 } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";
import { Link } from "react-router";

const NEEDS = [
  {
    id: "life",
    title: "Life coverage",
    prompt: "Protect dependents if income stops",
  },
  {
    id: "critical",
    title: "Critical illness",
    prompt: "Lump sum support during recovery",
  },
  {
    id: "disability",
    title: "Disability / income",
    prompt: "Replace income if you cannot work",
  },
  {
    id: "health",
    title: "Health top-up",
    prompt: "Dental, vision, or extended benefits",
  },
  {
    id: "family",
    title: "Family package",
    prompt: "Combine covers for household planning",
  },
];

export default function InsurancePlanner() {
  const { user } = useAuth();
  const key = `fswg:insure-plan:${user?._id || "guest"}`;
  const [selected, setSelected] = useState<string[]>([]);
  const [dependents, setDependents] = useState(0);
  const [budget, setBudget] = useState(75);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      if (raw.selected) setSelected(raw.selected);
      if (raw.dependents != null) setDependents(raw.dependents);
      if (raw.budget != null) setBudget(raw.budget);
      if (raw.notes) setNotes(raw.notes);
    } catch {
      /* ignore */
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify({ selected, dependents, budget, notes }),
    );
  }, [key, selected, dependents, budget, notes]);

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <ClientToolShell
      eyebrow="In-app · 05"
      title="Insurance planner"
      description="Capture coverage interests and a monthly budget inside the app, then discuss them with your advisor in Messages or Video."
      icon={Shield}
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 border-b border-[#E5EAF0] pb-8 lg:col-span-7">
          <h2 className="text-lg font-bold text-[#12213E]">
            What do you want to explore?
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {NEEDS.map((n) => {
              const on = selected.includes(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => toggle(n.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    on
                      ? "border-[#C69259] bg-[#FFF8F0]"
                      : "border-[#EEF2F6] bg-[#F7FBFE]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#12213E]">
                      {n.title}
                    </p>
                    {on && <CheckCircle2 className="h-4 w-4 text-[#C69259]" />}
                  </div>
                  <p className="mt-1 text-xs text-[#6B7280]">{n.prompt}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-b border-[#E5EAF0] pb-8 lg:col-span-5 space-y-4">
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Dependents
            <input
              type="number"
              min={0}
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value) || 0)}
              className="mt-2 w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm font-semibold text-[#12213E] outline-none"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Monthly budget (CAD)
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              className="mt-2 w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm font-semibold text-[#12213E] outline-none"
            />
          </label>
          <label className="block text-xs font-semibold uppercase text-[#6B7280]">
            Notes for your advisor
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border-0 bg-white/80 px-4 py-3 text-sm text-[#12213E] outline-none"
              placeholder="Timeline, employer benefits, questions…"
            />
          </label>
          <p className="text-sm font-semibold text-[#12213E]">
            {selected.length} coverage area{selected.length === 1 ? "" : "s"}{" "}
            selected · saved on this device
          </p>
          <Link
            to="/app/messages"
            className="inline-flex rounded-2xl bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Message advisor about this plan
          </Link>
        </div>
      </div>
    </ClientToolShell>
  );
}
