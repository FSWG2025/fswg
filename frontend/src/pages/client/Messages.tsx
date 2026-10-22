import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Loader2, Circle } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "FS";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [peer, setPeer] = useState<any>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/messages");
      setMessages(data.messages || []);
      setPeer(data.peer);
      await api.patch("/messages/read").catch(() => {});
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 20000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post("/messages", { body: body.trim() });
      setMessages((prev) => [...prev, data]);
      setBody("");
      inputRef.current?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const peerName = peer?.name || "First Step Support";
  const peerRole = peer?.expertise || peer?.role || "Advisor / support";

  return (
    <ClientToolShell
      eyebrow="In-app · 01"
      title="Messages"
      description="Secure chat with your assigned advisor or First Step support. Stay inside the app for follow-ups."
      icon={MessageSquare}
    >
      <div className="flex h-[min(72vh,680px)] flex-col overflow-hidden rounded-2xl bg-[#F4F7FA]">
        {/* Conversation header */}
        <div className="flex items-center gap-3 border-b border-[#E5EAF0]/80 bg-white/80 px-4 py-3.5 backdrop-blur-sm sm:px-5">
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#12213E] text-sm font-bold tracking-wide text-white">
              {initials(peerName)}
            </div>
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#65A30D]"
              title="Available"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#12213E] sm:text-base">
              {peerName}
            </p>
            <p className="flex items-center gap-1.5 truncate text-xs text-[#6B7280]">
              <Circle className="h-1.5 w-1.5 fill-[#65A30D] text-[#65A30D]" />
              {peerRole}
            </p>
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
          {loading ? (
            <div className="flex h-full items-center justify-center text-[#6B7280]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(18,33,62,0.06)]">
                <MessageSquare className="h-6 w-6 text-[#C69259]" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#12213E]">
                Start the conversation
              </p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#6B7280]">
                Ask about rentals, insurance planning, or your next consultation.
                Messages stay in your client hub.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = String(m.sender?._id || m.sender) === String(user?._id);
              return (
                <div
                  key={m._id}
                  className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}
                >
                  {!mine && (
                    <div className="mt-auto hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#12213E] text-[10px] font-bold text-white sm:flex">
                      {initials(peerName)}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[min(85%,28rem)] px-4 py-2.5 text-sm leading-relaxed",
                      mine
                        ? "rounded-[20px] rounded-br-md bg-[#12213E] text-white shadow-[0_4px_14px_rgba(18,33,62,0.18)]"
                        : "rounded-[20px] rounded-bl-md bg-white text-[#12213E] shadow-[0_2px_10px_rgba(18,33,62,0.05)] ring-1 ring-[#E5EAF0]/80"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={cn(
                        "mt-1.5 text-[10px] tabular-nums",
                        mine ? "text-right text-white/45" : "text-[#9CA3AF]"
                      )}
                    >
                      {formatTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pill composer */}
        <div className="border-t border-[#E5EAF0]/60 bg-white/70 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4">
          <form
            onSubmit={send}
            className="flex items-center gap-1.5 rounded-full border border-[#E5EAF0] bg-[#EEF2F6] p-1.5 pl-4 shadow-[inset_0_1px_2px_rgba(18,33,62,0.03)] transition focus-within:border-[#C69259]/55 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(198,146,89,0.12)]"
          >
            <input
              ref={inputRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a message…"
              aria-label="Message"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#12213E] placeholder:text-[#9CA3AF] outline-none"
            />
            <button
              type="submit"
              disabled={sending || !body.trim()}
              aria-label="Send message"
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95",
                body.trim()
                  ? "bg-[#12213E] text-white shadow-[0_4px_12px_rgba(18,33,62,0.22)] hover:bg-[#0D1A2E]"
                  : "bg-[#D1D5DB]/60 text-[#9CA3AF]",
                "disabled:pointer-events-none disabled:opacity-60"
              )}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 translate-x-px" />
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">
            Messages are private between you and First Step advisors
          </p>
        </div>
      </div>
    </ClientToolShell>
  );
}
