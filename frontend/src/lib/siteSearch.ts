import searchIndex, { type SearchableItem } from "@/lib/searchIndex";

export type SiteSearchHit = {
  id: string;
  type: string;
  title: string;
  snippet: string;
  url: string;
  sectionId?: string;
};

function scoreItem(item: SearchableItem, q: string): number {
  const query = q.toLowerCase().trim();
  if (!query) return 0;
  const title = item.title.toLowerCase();
  const snippet = item.snippet.toLowerCase();
  const hay = `${title} ${snippet} ${item.url} ${item.type}`.toLowerCase();

  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (snippet.includes(query)) return 40;
  // token match: search "anything" loosely
  const tokens = query.split(/\s+/).filter(Boolean);
  const hitCount = tokens.filter((t) => hay.includes(t)).length;
  if (hitCount === 0) return 0;
  return 10 + hitCount * 8;
}

/** Instant client-side search across pages, FAQs, topics, and insights. */
export function searchSiteIndex(query: string, limit = 24): SiteSearchHit[] {
  const q = query.trim();
  if (!q) return [];

  return searchIndex
    .map((item, i) => ({ item, i, score: scoreItem(item, q) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map(({ item, i }) => ({
      id: `local-${item.type}-${i}`,
      type: item.type,
      title: item.title,
      snippet: item.snippet,
      url: item.url,
      sectionId: item.sectionId,
    }));
}

export function mergeSearchHits(
  local: SiteSearchHit[],
  remote: SiteSearchHit[],
  limit = 30
): SiteSearchHit[] {
  const seen = new Set<string>();
  const out: SiteSearchHit[] = [];

  const push = (hit: SiteSearchHit) => {
    const key = `${hit.url}|${hit.title}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(hit);
  };

  local.forEach(push);
  remote.forEach(push);
  return out.slice(0, limit);
}
