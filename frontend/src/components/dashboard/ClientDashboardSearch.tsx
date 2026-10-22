import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, ArrowUpRight, Command } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export type DashboardSearchItem = {
  id: string;
  title: string;
  blurb: string;
  category: string;
  keywords: string[];
  href?: string;
  sectionId?: string;
  action?: () => void;
};

type Props = {
  items: DashboardSearchItem[];
  className?: string;
};

function scoreItem(item: DashboardSearchItem, q: string): number {
  const hay = [item.title, item.blurb, item.category, ...item.keywords]
    .join(" ")
    .toLowerCase();
  if (!q) return 0;
  if (item.title.toLowerCase().startsWith(q)) return 100;
  if (item.title.toLowerCase().includes(q)) return 80;
  if (hay.includes(q)) return 50;
  const parts = q.split(/\s+/).filter(Boolean);
  const hits = parts.filter((p) => hay.includes(p)).length;
  return hits ? hits * 20 : 0;
}

export default function ClientDashboardSearch({ items, className }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (!deferred) return items.slice(0, 8);
    return items
      .map((item) => ({ item, score: scoreItem(item, deferred) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => r.item);
  }, [deferred, items]);

  useEffect(() => {
    setActiveIdx(0);
  }, [deferred]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (item: DashboardSearchItem) => {
    setOpen(false);
    setQuery("");
    if (item.action) {
      item.action();
      return;
    }
    if (item.sectionId) {
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("ring-2", "ring-[#C69259]/40");
        window.setTimeout(
          () => el.classList.remove("ring-2", "ring-[#C69259]/40"),
          1600
        );
        return;
      }
    }
    if (item.href) navigate(item.href);
  };

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-xl", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-[#E5EAF0] bg-[#F4F6F8] px-3.5 py-2.5 transition",
          open &&
            "border-[#C69259]/50 bg-white shadow-[0_0_0_3px_rgba(198,146,89,0.12)]"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIdx((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && results[activeIdx]) {
              e.preventDefault();
              run(results[activeIdx]);
            } else if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
            }
          }}
          placeholder="Search tools, sections, actions…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#12213E] placeholder:text-[#9CA3AF] outline-none"
          aria-label="Search dashboard"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#EEF2F6] hover:text-[#12213E]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden items-center gap-0.5 rounded-md border border-[#E5EAF0] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF] sm:inline-flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-[0_16px_40px_rgba(18,33,62,0.12)]">
          <div className="border-b border-[#EEF2F6] px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              {deferred
                ? `${results.length} result${results.length === 1 ? "" : "s"}`
                : "Popular destinations"}
            </p>
          </div>
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#6B7280]">
              Nothing matches “{query}”. Try “rental”, “wealth”, or “messages”.
            </p>
          ) : (
            <ul className="max-h-[min(60vh,360px)] overflow-y-auto py-1">
              {results.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => run(item)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                      i === activeIdx ? "bg-[#F7FBFE]" : "hover:bg-[#F7FBFE]"
                    )}
                  >
                    <span className="mt-0.5 rounded-md bg-[#EEF2F6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                      {item.category}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#12213E]">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#6B7280] line-clamp-1">
                        {item.blurb}
                      </span>
                    </span>
                    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#C69259]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
