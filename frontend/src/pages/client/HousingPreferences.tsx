import { useEffect, useState } from "react";
import { Home, Plus, Trash2 } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";
import { Link } from "react-router";

export default function HousingPreferences() {
  const { user } = useAuth();
  const key = `fswg:housing:${user?._id || "guest"}`;
  const [cities, setCities] = useState<string[]>(["Toronto"]);
  const [cityInput, setCityInput] = useState("");
  const [budgetMin, setBudgetMin] = useState(1500);
  const [budgetMax, setBudgetMax] = useState(2500);
  const [bedrooms, setBedrooms] = useState(1);
  const [moveIn, setMoveIn] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "{}");
      if (raw.cities) setCities(raw.cities);
      if (raw.budgetMin != null) setBudgetMin(raw.budgetMin);
      if (raw.budgetMax != null) setBudgetMax(raw.budgetMax);
      if (raw.bedrooms != null) setBedrooms(raw.bedrooms);
      if (raw.moveIn) setMoveIn(raw.moveIn);
      if (raw.notes) setNotes(raw.notes);
    } catch {
      /* ignore */
    }
  }, [key]);

  useEffect(() => {
    localStorage.setItem(
      key,
      JSON.stringify({ cities, budgetMin, budgetMax, bedrooms, moveIn, notes }),
    );
  }, [key, cities, budgetMin, budgetMax, bedrooms, moveIn, notes]);

  return (
    <ClientToolShell
      eyebrow="In-app · 06"
      title="Housing preferences"
      description="Save cities, rent budget, and move-in timing for rental support. Used when you apply or meet an advisor."
      icon={Home}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-b border-[#E5EAF0] pb-8 space-y-4">
          <h2 className="text-lg font-bold text-[#12213E]">Preferred cities</h2>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full bg-[#E8F5C8] px-3 py-1.5 text-xs font-semibold text-[#12213E]"
              >
                {c}
                <button
                  type="button"
                  onClick={() => setCities(cities.filter((x) => x !== c))}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Add city"
              className="flex-1 border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#C69259]"
            />
            <button
              type="button"
              onClick={() => {
                if (!cityInput.trim()) return;
                setCities([...cities, cityInput.trim()]);
                setCityInput("");
              }}
              className="rounded-2xl bg-[#12213E] px-4 text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold uppercase text-[#6B7280]">
              Min rent
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value) || 0)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-3 py-2.5 text-sm font-semibold"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-[#6B7280]">
              Max rent
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value) || 0)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-3 py-2.5 text-sm font-semibold"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-[#6B7280]">
              Bedrooms
              <input
                type="number"
                min={0}
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value) || 0)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-3 py-2.5 text-sm font-semibold"
              />
            </label>
            <label className="text-xs font-semibold uppercase text-[#6B7280]">
              Target move-in
              <input
                type="month"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-3 py-2.5 text-sm font-semibold"
              />
            </label>
          </div>
        </div>
        <div className="border-b border-[#E5EAF0] pb-8 text-[#12213E]">
          <h2 className="text-lg font-bold">Notes & next step</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            placeholder="Pet-friendly, near transit, school district…"
            className="mt-3 w-full rounded-2xl border-0 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
          />
          <p className="mt-3 text-sm text-white/65">
            Preferences are saved on this device and ready when you start a
            rental application.
          </p>
          <Link
            to="/rental-applications/new"
            className="mt-5 inline-flex rounded-2xl bg-[#C69259] px-4 py-2.5 text-sm font-semibold text-[#12213E]"
          >
            Continue to rental application
          </Link>
        </div>
      </div>
    </ClientToolShell>
  );
}
