/**
 * IP geolocation abstraction.
 * Uses IPAPI (free tier) when GEOIP_PROVIDER=ipapi and GEOIP_TOKEN is set.
 * Falls back to Cloudflare country header / empty coords in dev.
 */

export interface GeoLookupResult {
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  accuracyRadiusKm?: number;
  isp?: string;
  isProxy?: boolean;
  isVpn?: boolean;
}

const cache = new Map<string, { at: number; data: GeoLookupResult }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const cleaned = ip.replace(/^::ffff:/, "");
  return (
    cleaned === "127.0.0.1" ||
    cleaned === "::1" ||
    cleaned.startsWith("10.") ||
    cleaned.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(cleaned)
  );
}

export async function lookupIpGeo(
  ip: string,
  hints?: { country?: string },
): Promise<GeoLookupResult> {
  const cleaned = (ip || "").replace(/^::ffff:/, "").trim();
  if (!cleaned || isPrivateIp(cleaned)) {
    return {
      country: hints?.country || "Local",
      city: "Local",
      region: undefined,
      lat: undefined,
      lng: undefined,
      accuracyRadiusKm: 50,
    };
  }

  const cached = cache.get(cleaned);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const provider = (process.env.GEOIP_PROVIDER || "ipapi").toLowerCase();
  let result: GeoLookupResult = {
    country: hints?.country,
    accuracyRadiusKm: 25,
  };

  try {
    if (provider === "ipapi") {
      const token = process.env.GEOIP_TOKEN || process.env.IPAPI_KEY || "";
      const url = token
        ? `https://ipapi.co/${encodeURIComponent(cleaned)}/json/?key=${token}`
        : `https://ipapi.co/${encodeURIComponent(cleaned)}/json/`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3500),
      });
      if (res.ok) {
        const data: any = await res.json();
        if (!data.error) {
          result = {
            country: data.country_name || data.country || hints?.country,
            region: data.region || data.region_code,
            city: data.city,
            lat:
              typeof data.latitude === "number"
                ? data.latitude
                : parseFloat(data.latitude),
            lng:
              typeof data.longitude === "number"
                ? data.longitude
                : parseFloat(data.longitude),
            accuracyRadiusKm: 25,
            isp: data.org || data.asn,
            isProxy: Boolean(data.threat?.is_proxy),
            isVpn: Boolean(data.threat?.is_vpn),
          };
          if (Number.isNaN(result.lat)) result.lat = undefined;
          if (Number.isNaN(result.lng)) result.lng = undefined;
        }
      }
    }
  } catch (err) {
    console.warn("[geoip] lookup failed:", (err as Error).message);
  }

  cache.set(cleaned, { at: Date.now(), data: result });
  if (cache.size > 5000) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  return result;
}
