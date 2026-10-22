import { useEffect, useMemo, useState } from "react";
import { Gift, Copy, Share2 } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";

export default function Referrals() {
  const { user } = useAuth();
  const code = useMemo(
    () =>
      `FSWG-${String(user?._id || "GUEST")
        .slice(-6)
        .toUpperCase()}`,
    [user?._id],
  );
  const link = `${window.location.origin}/register?ref=${code}`;
  const key = `fswg:referrals:${user?._id || "guest"}`;
  const [invites, setInvites] = useState<{ email: string; at: string }[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      setInvites(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      setInvites([]);
    }
  }, [key]);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied");
  };

  const share = async () => {
    const text = `Join me at First Step Wealth Group for rental support, insurance guidance, and wealth planning: ${link}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "First Step Wealth Group",
          text,
          url: link,
        });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Invite text copied");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <ClientToolShell
      eyebrow="In-app · 09"
      title="Referral hub"
      description="Invite family or friends to First Step. Track who you invited from inside the app."
      icon={Gift}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-b border-[#E5EAF0] pb-8 text-[#12213E]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#C69259]">
            Your code
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-wide">{code}</p>
          <p className="mt-3 break-all text-sm text-white/65">{link}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#12213E]"
            >
              <Copy className="h-4 w-4" /> Copy link
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#C69259] px-4 py-2.5 text-sm font-semibold text-[#12213E]"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
        <div className="border-b border-[#E5EAF0] pb-8">
          <h2 className="text-lg font-bold text-[#12213E]">Log an invite</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Keep a private list of people you told about First Step.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              const next = [
                { email: email.trim(), at: new Date().toISOString() },
                ...invites,
              ];
              setInvites(next);
              localStorage.setItem(key, JSON.stringify(next));
              setEmail("");
              toast.success("Invite logged");
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@email.com"
              className="flex-1 border-0 border-b border-[#E5EAF0] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#C69259]"
              required
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#12213E] px-4 py-3 text-sm font-semibold text-white"
            >
              Log
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {invites.map((i) => (
              <li
                key={i.email + i.at}
                className="flex items-center justify-between rounded-xl bg-[#F7FBFE] px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#12213E]">{i.email}</span>
                <span className="text-[11px] text-[#9CA3AF]">
                  {new Date(i.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ClientToolShell>
  );
}
