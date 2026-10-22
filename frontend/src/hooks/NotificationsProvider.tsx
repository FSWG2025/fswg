import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { socketOrigin } from "@/lib/socketOrigin";
import {
  getAlertSoundPref,
  playAlertSound,
  unlockAlertSound,
} from "@/lib/alertSound";
import { sanitizeAppPath } from "@/lib/authReturnTo";

export type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
  critical?: boolean;
  user?: string;
};

type NotificationsContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markOneRead: (n: AppNotification) => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Unlock audio + open panel (call from bell click). */
  openNotificationsWithSoundUnlock: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const userId = user?._id ? String(user._id) : undefined;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      const list = (data.notifications || []) as AppNotification[];
      setItems(list);
      setUnreadCount(data.unreadCount || 0);
      list.forEach((n) => seenIdsRef.current.add(n._id));
    } catch {
      /* silent – header should stay usable */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  // Phase 1: live Socket.IO for admins
  useEffect(() => {
    if (!isAdmin || !userId) return;

    const token = localStorage.getItem("fswg_token") || undefined;
    const socket = io(socketOrigin(), {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    });
    socketRef.current = socket;

    const onAlert = (payload: {
      critical?: boolean;
      title?: string;
      message?: string;
      link?: string;
      sourceKey?: string;
    }) => {
      const dedupe = payload.sourceKey
        ? `evt:${payload.sourceKey}`
        : `evt:${payload.title}:${Date.now()}`;
      if (seenIdsRef.current.has(dedupe)) return;
      seenIdsRef.current.add(dedupe);

      void refresh();

      if (payload.critical !== false && getAlertSoundPref(userId, true)) {
        void playAlertSound();
      }

      const safeLink = sanitizeAppPath(payload.link);
      toast.message(payload.title || "New admin alert", {
        description: (payload.message || "").slice(0, 120),
        action: safeLink
          ? {
              label: "Open",
              onClick: () => navigate(safeLink),
            }
          : undefined,
      });
    };

    socket.on("connect", () => {
      socket.emit("admin:subscribe");
    });
    socket.on("admin:alert", onAlert);

    return () => {
      socket.emit("admin:unsubscribe");
      socket.off("admin:alert", onAlert);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAdmin, userId, refresh, navigate]);

  const openNotifications = useCallback(() => setOpen(true), []);
  const closeNotifications = useCallback(() => setOpen(false), []);

  const openNotificationsWithSoundUnlock = useCallback(() => {
    void unlockAlertSound();
    setOpen(true);
  }, []);

  const markOneRead = useCallback(async (n: AppNotification) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setItems((prev) =>
          prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openNotifications,
      closeNotifications,
      openNotificationsWithSoundUnlock,
      items,
      unreadCount,
      loading,
      refresh,
      markOneRead,
      markAllRead,
    }),
    [
      open,
      openNotifications,
      closeNotifications,
      openNotificationsWithSoundUnlock,
      items,
      unreadCount,
      loading,
      refresh,
      markOneRead,
      markAllRead,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider"
    );
  }
  return ctx;
}

/** Safe for optional mounts outside the provider (falls back to local no-ops). */
export function useNotificationsOptional() {
  return useContext(NotificationsContext);
}
