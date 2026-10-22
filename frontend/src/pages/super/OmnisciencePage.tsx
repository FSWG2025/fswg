import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import { formatExactDateTime } from "@/features/admin/activity/activityMeta";

type Event = {
  id: string;
  at: string;
  action: string;
  details?: string;
  actor?: { name?: string; email?: string; role?: string; id?: string } | null;
  ip?: string;
  locationLabel?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  lat?: number;
  lng?: number;
  resourceType?: string;
  resourceId?: string;
};

export default function OmnisciencePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [staffOnly, setStaffOnly] = useState(false);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  const load = (reset = false) => {
    setLoading(true);
    api
      .get("/super/activity/stream", {
        params: {
          limit: 80,
          cursor: reset ? undefined : cursor || undefined,
          staffOnly: staffOnly ? "1" : undefined,
          action: action || undefined,
        },
      })
      .then(({ data }) => {
        setEvents((prev) =>
          reset ? data.events || [] : [...prev, ...(data.events || [])],
        );
        setCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setCursor(null);
    load(true);
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        api
          .get("/super/activity/stream", {
            params: {
              limit: 40,
              staffOnly: staffOnly ? "1" : undefined,
              action: action || undefined,
            },
          })
          .then(({ data }) => {
            setEvents(data.events || []);
            setCursor(data.nextCursor);
          })
          .catch(() => {});
      }
    }, 12_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffOnly]);

  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>Omniscience</p>
        <h2 className={SUPER.title}>Universal activity stream</h2>
        <p className={SUPER.body}>
          Every mutation, login, kill switch, and impersonation: with IP for
          supers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter action…"
          className="rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] px-3 py-2 text-sm text-[#12213E]"
        />
        <button type="button" className={SUPER.primaryBtn} onClick={() => load(true)}>
          Apply
        </button>
        <button
          type="button"
          className={staffOnly ? SUPER.primaryBtn : SUPER.armedBtn}
          onClick={() => setStaffOnly((v) => !v)}
        >
          Staff shadow {staffOnly ? "ON" : "OFF"}
        </button>
        <a
          href={`${(import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api"}/super/activity/export?format=csv`}
          className={SUPER.ghostLink}
          onClick={(e) => {
            e.preventDefault();
            api
              .get("/super/activity/export", {
                params: { format: "csv" },
                responseType: "blob",
              })
              .then((res) => {
                const url = URL.createObjectURL(res.data);
                const a = document.createElement("a");
                a.href = url;
                a.download = "omniscience.csv";
                a.click();
              });
          }}
        >
          Export CSV
        </a>
      </div>

      <div
        ref={listRef}
        className={`${SUPER.card} max-h-[70vh] overflow-auto`}
      >
        {events.length === 0 && !loading ? (
          <p className={SUPER.body}>No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded-xl border border-[#E5EAF0]/70 bg-[#F7FBFE]/40 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-[#12213E]">{ev.action}</p>
                  <time className="text-[11px] font-medium text-[#6B7280]">
                    {formatExactDateTime(ev.at)}
                  </time>
                </div>
                {ev.details ? (
                  <p className="mt-0.5 text-xs text-[#4B5563]">{ev.details}</p>
                ) : null}
                <p className="mt-1 text-[11px] text-[#9CA3AF]">
                  {ev.actor
                    ? `${ev.actor.name}${ev.actor.email ? ` <${ev.actor.email}>` : ""} · ${ev.actor.role}`
                    : "system"}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                  {[
                    ev.locationLabel ||
                      [ev.city, ev.region, ev.country].filter(Boolean).join(", "),
                    ev.ip ? `IP ${ev.ip}` : null,
                    typeof ev.lat === "number" && typeof ev.lng === "number"
                      ? `${ev.lat.toFixed(4)}, ${ev.lng.toFixed(4)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Location unavailable"}
                  {ev.resourceType === "user" && ev.resourceId ? (
                    <>
                      {" · "}
                      <Link
                        to={`/dashboard/super/forensics/user/${ev.resourceId}`}
                        className="text-[#C69259]"
                      >
                        Open forensics
                      </Link>
                    </>
                  ) : null}
                  {ev.resourceType === "visitor" && ev.resourceId ? (
                    <>
                      {" · "}
                      <Link
                        to={`/dashboard/super/forensics/visitor/${ev.resourceId}`}
                        className="text-[#C69259]"
                      >
                        Open forensics
                      </Link>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
        {cursor ? (
          <button
            type="button"
            className={`mt-4 ${SUPER.armedBtn}`}
            onClick={() => load(false)}
            disabled={loading}
          >
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
}
