import { useCallback, useEffect, useRef, useState } from "react";
import { StickyNote, Plus, Trash2, Loader2, Cloud } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Note = {
  _id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export default function SecureNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const notesRef = useRef<Note[]>([]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notes");
      const list: Note[] = data.notes || [];
      setNotes(list);
      setActiveId((prev) => prev || list[0]?._id || null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = notes.find((n) => n._id === activeId) || null;

  const persistNote = useCallback(async (id: string) => {
    const note = notesRef.current.find((n) => n._id === id);
    if (!note) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/notes/${id}`, {
        title: note.title,
        body: note.body,
      });
      // Keep local draft text; only sync updatedAt so typing never snaps back
      setNotes((prev) =>
        prev.map((n) =>
          n._id === id
            ? { ...n, updatedAt: data.updatedAt || n.updatedAt }
            : n
        )
      );
    } catch {
      toast.error("Could not save note");
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleSave = (id: string) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void persistNote(id);
    }, 450);
  };

  const create = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/notes", {
        title: "",
        body: "",
      });
      setNotes((prev) => [data, ...prev]);
      setActiveId(data._id);
    } catch {
      toast.error("Could not create note");
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => {
        const next = prev.filter((x) => x._id !== id);
        if (activeId === id) setActiveId(next[0]?._id || null);
        return next;
      });
    } catch {
      toast.error("Could not delete note");
    }
  };

  const updateLocal = (patch: Partial<Pick<Note, "title" | "body">>) => {
    if (!active) return;
    setNotes((prev) =>
      prev.map((n) =>
        n._id === active._id
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n
      )
    );
    scheduleSave(active._id);
  };

  const displayTitle = (title: string) =>
    title.trim() ? title : "Untitled note";

  return (
    <ClientToolShell
      eyebrow="In-app · 08"
      title="Secure notes"
      description="Private notes for consultation prep, landlord contacts, and questions. Synced to your First Step account."
      icon={StickyNote}
      actions={
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-[#6B7280] sm:inline-flex">
            <Cloud className="h-3.5 w-3.5 text-[#C69259]" />
            {saving ? "Saving…" : "Synced"}
          </span>
          <button
            type="button"
            onClick={create}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            New note
          </button>
        </div>
      }
    >
      <div className="grid min-h-[480px] gap-4 lg:grid-cols-12">
        <div className="border-b border-[#E5EAF0] pb-6 lg:col-span-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6B7280]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ul className="space-y-1">
              {notes.length === 0 ? (
                <p className="p-4 text-center text-sm text-[#6B7280]">No notes yet.</p>
              ) : (
                notes.map((n) => (
                  <li key={n._id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveId(n._id)}
                      className={cn(
                        "min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        activeId === n._id
                          ? "bg-[#12213E] text-white"
                          : "bg-[#F7FBFE] text-[#12213E] hover:bg-[#E4EFF6]"
                      )}
                    >
                      <p className="truncate font-semibold">{displayTitle(n.title)}</p>
                      <p
                        className={cn(
                          "truncate text-[10px]",
                          activeId === n._id ? "text-white/50" : "text-[#9CA3AF]"
                        )}
                      >
                        {new Date(n.updatedAt).toLocaleString()}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(n._id)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <div className="lg:col-span-8 lg:pl-2">
          {active ? (
            <>
              <input
                value={active.title}
                onChange={(e) => updateLocal({ title: e.target.value })}
                className="w-full border-0 bg-transparent text-xl font-bold text-[#12213E] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Note title"
              />
              <textarea
                value={active.body}
                onChange={(e) => updateLocal({ body: e.target.value })}
                rows={16}
                placeholder="Write privately…"
                className="mt-3 w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-[#334155] outline-none"
              />
            </>
          ) : (
            <p className="py-20 text-center text-sm text-[#6B7280]">
              {loading ? "Loading…" : "Create a note to start writing."}
            </p>
          )}
        </div>
      </div>
    </ClientToolShell>
  );
}
