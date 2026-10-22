/**
 * Warm snapshot palette: each card gets a distinct soft tone
 * (same family as the lime “Applications” card).
 */
export const SNAPSHOT_TONES = [
  {
    id: "lime",
    border: "border-[#D4E8A8]",
    bg: "bg-[#F3F9E4]",
    iconBg: "bg-white/70",
  },
  {
    id: "peach",
    border: "border-[#F0C9B0]",
    bg: "bg-[#FFF1EB]",
    iconBg: "bg-white/70",
  },
  {
    id: "gold",
    border: "border-[#E8D5BC]",
    bg: "bg-[#FBF4EB]",
    iconBg: "bg-white/70",
  },
  {
    id: "blush",
    border: "border-[#E8C4C4]",
    bg: "bg-[#FDF2F2]",
    iconBg: "bg-white/70",
  },
  {
    id: "sand",
    border: "border-[#E5D9C5]",
    bg: "bg-[#FAF6EF]",
    iconBg: "bg-white/70",
  },
  {
    id: "apricot",
    border: "border-[#E8C9A8]",
    bg: "bg-[#FFF7ED]",
    iconBg: "bg-white/70",
  },
  {
    id: "rose",
    border: "border-[#E8B4B8]",
    bg: "bg-[#FFF0F1]",
    iconBg: "bg-white/70",
  },
  {
    id: "honey",
    border: "border-[#E6D08A]",
    bg: "bg-[#FFFBEB]",
    iconBg: "bg-white/70",
  },
] as const;

export type SnapshotTone = (typeof SNAPSHOT_TONES)[number];

export function snapshotToneAt(index: number): SnapshotTone {
  return SNAPSHOT_TONES[index % SNAPSHOT_TONES.length];
}
