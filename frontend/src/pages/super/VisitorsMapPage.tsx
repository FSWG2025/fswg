import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";

type V = {
  visitorId: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  lastPath?: string;
  lastSeenAt?: string;
  paths?: string[];
  riskScore?: number;
  linkedEmail?: string;
  accuracyRadiusKm?: number;
};

/** Default world view when there are no pins yet (e.g. localhost). */
const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 6);
      return;
    }
    const b = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(b.pad(0.25));
  }, [map, points]);
  return null;
}

export default function VisitorsMapPage() {
  const [visitors, setVisitors] = useState<V[]>([]);
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<V | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (document.visibilityState === "hidden") return;
    api
      .get("/super/visitors/map", {
        params: { live: live ? "1" : undefined, sinceMinutes: 1440 },
      })
      .then(({ data }) => {
        setVisitors(data.visitors || []);
        setError("");
      })
      .catch(() => setError("Map data unavailable"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 12_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const points = useMemo(
    () =>
      visitors
        .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
        .map((v) => [v.lat, v.lng] as [number, number]),
    [visitors],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className={SUPER.eyebrow}>Visitor intelligence</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#12213E]">
            Visitor map
          </h2>
          <p className={`${SUPER.body} mt-1`}>
            Pins use approximate IP geolocation. The map stays visible even when
            no pins have coordinates yet.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={live ? SUPER.primaryBtn : SUPER.armedBtn}
            onClick={() => setLive(true)}
          >
            Live · 5m
          </button>
          <button
            type="button"
            className={!live ? SUPER.primaryBtn : SUPER.armedBtn}
            onClick={() => setLive(false)}
          >
            Last 24h
          </button>
        </div>
      </div>

      {error ? (
        <div className={SUPER.panelSoft}>
          <p className="text-sm font-medium text-[#12213E]">{error}</p>
          <p className={`mt-1 ${SUPER.body}`}>
            Set GEOIP_TOKEN for richer coordinates, or wait for public-IP traffic.
          </p>
        </div>
      ) : null}

      {!loading && points.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#E5EAF0] bg-white px-3 py-2 text-xs text-[#6B7280]">
          No geolocated visitors in this window yet (common on localhost). Map
          below is ready for the first pin.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="relative overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/70 text-sm text-[#6B7280]">
              Loading map…
            </div>
          )}
          <MapContainer
            center={points[0] || DEFAULT_CENTER}
            zoom={points.length ? 3 : DEFAULT_ZOOM}
            className="h-[360px] w-full sm:h-[420px]"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={points} />
            {visitors.map((v) => (
              <CircleMarker
                key={v.visitorId}
                center={[v.lat, v.lng]}
                radius={8}
                pathOptions={{
                  color: "#C69259",
                  fillColor: "#12213E",
                  fillOpacity: 0.9,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelected(v),
                }}
              >
                <Popup>
                  <strong>{v.city || v.country || "Approx."}</strong>
                  <br />
                  {v.lastPath}
                  <br />
                  <Link to={`/dashboard/super/forensics/visitor/${v.visitorId}`}>
                    Open dossier
                  </Link>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <aside className={SUPER.card}>
          <p className={SUPER.eyebrow}>Drawer</p>
          <h3 className={`mt-1 ${SUPER.title}`}>
            {selected ? "Visitor trail" : `${points.length} pins`}
          </h3>
          {!selected ? (
            <p className={`mt-3 ${SUPER.body}`}>
              Click a pin for the path trail, or wait for traffic with geo data.
            </p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-medium text-[#12213E]">
                {selected.city || "-"}, {selected.country || "-"}{" "}
                <span className="text-[10px] text-[#C69259]">approx.</span>
              </p>
              <p className="text-[#6B7280]">
                {selected.linkedEmail || "Anonymous"}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                ±{selected.accuracyRadiusKm || 25} km · risk{" "}
                {selected.riskScore || 0}
              </p>
              <ol className="mt-3 max-h-56 list-decimal space-y-1 overflow-auto pl-4 text-xs text-[#6B7280]">
                {(selected.paths || [selected.lastPath])
                  .filter(Boolean)
                  .map((p, i) => (
                    <li key={`${p}-${i}`}>{p}</li>
                  ))}
              </ol>
              <Link
                to={`/dashboard/super/forensics/visitor/${selected.visitorId}`}
                className={`mt-3 inline-block ${SUPER.ghostLink}`}
              >
                Full forensics →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
