/**
 * Split long prose into short pages (by sentences) so UI stays compact.
 */
export function paginateText(text: string, maxChars = 240): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxChars) return [cleaned];

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  const pages: string[] = [];
  let current = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;

    if (sentence.length > maxChars) {
      if (current) {
        pages.push(current.trim());
        current = "";
      }
      // Hard-wrap oversized sentences on word boundaries
      const words = sentence.split(/\s+/);
      let chunk = "";
      for (const word of words) {
        const next = chunk ? `${chunk} ${word}` : word;
        if (next.length > maxChars && chunk) {
          pages.push(chunk);
          chunk = word;
        } else {
          chunk = next;
        }
      }
      if (chunk) current = chunk;
      continue;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars && current) {
      pages.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) pages.push(current.trim());
  return pages.length > 0 ? pages : [cleaned];
}
