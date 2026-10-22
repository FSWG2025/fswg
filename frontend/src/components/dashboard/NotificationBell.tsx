import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { sanitizeAppPath } from "@/lib/authReturnTo";
import {
  useNotifications,
  type AppNotification,
} from "@/hooks/NotificationsProvider";

const typeAccent: Record<string, string> = {
  consultation: "bg-sky-100 text-sky-800",
  rental: "bg-lime-100 text-lime-800",
  insurance: "bg-amber-100 text-amber-900",
  wealth: "bg-violet-100 text-violet-800",
  network: "bg-rose-100 text-rose-800",
  learning: "bg-teal-100 text-teal-800",
  system: "bg-slate-100 text-slate-700",
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    open,
    openNotificationsWithSoundUnlock,
    closeNotifications,
    items,
    unreadCount,
    loading,
    markOneRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNotifications();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeNotifications]);

  const markOne = async (n: AppNotification) => {
    await markOneRead(n);
    if (n.link) {
      const safe = sanitizeAppPath(n.link);
      closeNotifications();
      if (safe) navigate(safe);
    }
  };

  const countLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  const panel =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="notif-root"
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{
                  paddingTop: "max(1rem, env(safe-area-inset-top))",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                  paddingLeft: "max(1rem, env(safe-area-inset-left))",
                  paddingRight: "max(1rem, env(safe-area-inset-right))",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  type="button"
                  aria-label="Close notifications"
                  className="absolute inset-0 bg-[#12213E]/45 backdrop-blur-[3px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeNotifications}
                />

                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notifications-title"
                  className="relative z-10 flex w-full max-w-[420px] flex-col overflow-hidden rounded-[24px] border border-[#E5EAF0] bg-white shadow-[0_24px_64px_rgba(18,33,62,0.22)]"
                  style={{ maxHeight: "min(78vh, 560px)" }}
                  initial={{ opacity: 0, y: 28, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.85,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F6] px-5 py-4">
                    <div>
                      <h2
                        id="notifications-title"
                        className="text-base font-bold text-[#12213E]"
                      >
                        Notifications
                      </h2>
                      {unreadCount > 0 && (
                        <p className="mt-0.5 text-xs text-[#6B7280]">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllRead()}
                          className="inline-flex items-center gap-1 rounded-full bg-[#F3DFC7] px-3 py-1.5 text-[11px] font-semibold text-[#12213E] transition hover:bg-[#E8D5BC]"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Mark all
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={closeNotifications}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F6F8] text-[#6B7280] transition hover:bg-[#EEF2F6] hover:text-[#12213E]"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-16 text-[#6B7280]">
                        <Loader2 className="h-6 w-6 animate-spin text-[#C69259]" />
                        <p className="text-xs">Loading…</p>
                      </div>
                    ) : items.length === 0 ? (
                      <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F6F8]">
                          <Bell className="h-5 w-5 text-[#C69259]" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-[#12213E]">
                          You are all caught up
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          Important updates will appear here.
                        </p>
                      </div>
                    ) : (
                      <ul>
                        {items.map((n, i) => (
                          <motion.li
                            key={n._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: Math.min(i * 0.04, 0.28),
                              duration: 0.25,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => void markOne(n)}
                              className={cn(
                                "flex w-full flex-col items-start gap-1 border-b border-[#F1F5F9] px-5 py-3.5 text-left transition hover:bg-[#F7FBFE]",
                                !n.read && "bg-[#F7FBFE]/80"
                              )}
                            >
                              <div className="flex w-full items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-[#12213E]">
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C69259]" />
                                )}
                              </div>
                              <p className="line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
                                {n.message}
                              </p>
                              <div className="mt-1 flex w-full items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                    typeAccent[n.type] || typeAccent.system
                                  )}
                                >
                                  {n.type}
                                </span>
                                <span className="text-[10px] text-[#9CA3AF]">
                                  {new Date(n.createdAt).toLocaleString(
                                    "en-CA",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openNotificationsWithSoundUnlock}
        className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#12213E] text-white shadow-md transition hover:bg-[#0D1A2E] active:scale-95 touch-manipulation"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" strokeWidth={2.25} />
        {unreadCount > 0 && (
          <span className="pointer-events-none absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C69259] px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white">
            {countLabel}
          </span>
        )}
      </button>
      {panel}
    </>
  );
}
