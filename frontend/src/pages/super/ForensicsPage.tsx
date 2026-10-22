import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";

export default function ForensicsPage() {
  const { type = "user", id = "" } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    api
      .get(`/super/forensics/${type}/${id}`)
      .then(({ data: d }) => setData(d))
      .catch(() => setError("Could not load dossier"));
  }, [type, id]);

  if (error) {
    return (
      <div className={SUPER.card}>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={SUPER.card}>
        <p className={SUPER.body}>Loading forensics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={SUPER.eyebrow}>Forensics · {type}</p>
        <h2 className={SUPER.title}>Dossier</h2>
        <p className={SUPER.body}>
          Risk {data.risk?.score ?? 0}
          {data.risk?.factors?.length
            ? `: ${data.risk.factors.join(", ")}`
            : ""}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Subject</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-[#F7FBFE] p-3 text-[11px] text-[#6B7280]">
            {JSON.stringify(data.subject, null, 2)}
          </pre>
          {data.mapPin ? (
            <p className="mt-2 text-xs text-[#C69259]">
              Map pin ≈ {data.mapPin.lat?.toFixed?.(3)}, {data.mapPin.lng?.toFixed?.(3)}{" "}
              ({data.mapPin.label})
            </p>
          ) : null}
          {type === "user" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to={`/dashboard/super/people?q=${encodeURIComponent(data.subject?.email || "")}`}
                className={SUPER.ghostLink}
              >
                People control
              </Link>
            </div>
          )}
        </div>

        <div className={SUPER.card}>
          <p className={SUPER.eyebrow}>Related</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-[#F7FBFE] p-3 text-[11px] text-[#6B7280]">
            {JSON.stringify(
              {
                visitors: data.related?.visitors?.length,
                leads: data.related?.leads?.length,
                rentals: data.related?.rentals?.length,
                user: data.related?.user
                  ? { email: data.related.user.email, role: data.related.user.role }
                  : undefined,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>

      <div className={SUPER.card}>
        <p className={SUPER.eyebrow}>Timeline</p>
        <ul className="mt-3 max-h-[50vh] space-y-2 overflow-auto">
          {(data.timeline || []).length === 0 ? (
            <li className={SUPER.body}>No timeline events.</li>
          ) : (
            data.timeline.map((t: any, i: number) => (
              <li
                key={i}
                className="rounded-lg border border-[#E5EAF0]/60 px-3 py-2 text-sm"
              >
                <time className="text-[11px] text-[#9CA3AF]">
                  {t.at ? new Date(t.at).toLocaleString() : "-"}
                </time>
                <p className="text-[#12213E]">
                  <span className="text-[#C69259]">{t.kind}</span> {t.label}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
